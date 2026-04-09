import logging
import os
import re
from dataclasses import dataclass
from typing import Dict, Tuple

import pandas as pd
import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import execute_values

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    handlers=[logging.FileHandler('importer.log'), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)


@dataclass
class IdCache:
    states: Dict[Tuple[int, str], int]
    districts: Dict[Tuple[int, str], int]
    sub_districts: Dict[Tuple[int, str], int]


def normalize_name(value: str) -> str:
    if pd.isna(value):
        return ''
    value = str(value).strip()
    value = re.sub(r'\s+', ' ', value)
    return value.title()


def load_dataset(path: str) -> pd.DataFrame:
    if path.endswith('.csv'):
        df = pd.read_csv(path)
    else:
        df = pd.read_excel(path)

    required_cols = ['state', 'district', 'sub_district', 'village', 'postal_code', 'latitude', 'longitude']
    for col in required_cols:
        if col not in df.columns:
            df[col] = None

    df = df[required_cols]
    df['state'] = df['state'].apply(normalize_name)
    df['district'] = df['district'].apply(normalize_name)
    df['sub_district'] = df['sub_district'].apply(normalize_name)
    df['village'] = df['village'].apply(normalize_name)

    df = df[(df['state'] != '') & (df['district'] != '') & (df['sub_district'] != '') & (df['village'] != '')]
    df = df.drop_duplicates(subset=['state', 'district', 'sub_district', 'village'])

    logger.info('Dataset cleaned: %s rows', len(df))
    return df


def get_or_create_country(cur) -> int:
    cur.execute("""
        INSERT INTO country (code, name, "createdAt", "updatedAt")
        VALUES ('IND', 'India', NOW(), NOW())
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
    """)
    return cur.fetchone()[0]


def get_or_create(cur, table: str, parent_field: str, parent_id: int, name: str) -> int:
    query = f'''
        INSERT INTO {table} ("{parent_field}", name, "createdAt", "updatedAt")
        VALUES (%s, %s, NOW(), NOW())
        ON CONFLICT ("{parent_field}", name)
        DO UPDATE SET "updatedAt" = NOW()
        RETURNING id
    '''
    cur.execute(query, (parent_id, name))
    return cur.fetchone()[0]


def batch_insert_villages(cur, rows, country_id):
    sql = '''
      INSERT INTO villages (
        "countryId", "stateId", "districtId", "subDistrictId", name, normalized,
        "postalCode", latitude, longitude, "createdAt", "updatedAt"
      ) VALUES %s
      ON CONFLICT ("subDistrictId", normalized)
      DO UPDATE SET
        "postalCode" = EXCLUDED."postalCode",
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        "updatedAt" = NOW()
    '''
    execute_values(cur, sql, rows, page_size=1000)


def run(dataset_path: str):
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise ValueError('DATABASE_URL is required')

    df = load_dataset(dataset_path)
    conn = psycopg2.connect(database_url)

    try:
        with conn:
            with conn.cursor() as cur:
                country_id = get_or_create_country(cur)
                cache = IdCache(states={}, districts={}, sub_districts={})

                batch = []
                for _, row in df.iterrows():
                    state_key = (country_id, row['state'])
                    if state_key not in cache.states:
                        cache.states[state_key] = get_or_create(cur, 'states', 'countryId', country_id, row['state'])
                    state_id = cache.states[state_key]

                    district_key = (state_id, row['district'])
                    if district_key not in cache.districts:
                        cache.districts[district_key] = get_or_create(cur, 'districts', 'stateId', state_id, row['district'])
                    district_id = cache.districts[district_key]

                    sub_key = (district_id, row['sub_district'])
                    if sub_key not in cache.sub_districts:
                        cache.sub_districts[sub_key] = get_or_create(cur, 'sub_districts', 'districtId', district_id, row['sub_district'])
                    sub_id = cache.sub_districts[sub_key]

                    batch.append((
                        country_id,
                        state_id,
                        district_id,
                        sub_id,
                        row['village'],
                        row['village'].lower(),
                        str(row['postal_code']) if pd.notna(row['postal_code']) else None,
                        float(row['latitude']) if pd.notna(row['latitude']) else None,
                        float(row['longitude']) if pd.notna(row['longitude']) else None,
                        pd.Timestamp.now(),
                        pd.Timestamp.now(),
                    ))

                    if len(batch) >= 2000:
                        batch_insert_villages(cur, batch, country_id)
                        logger.info('Inserted batch of %s villages', len(batch))
                        batch = []

                if batch:
                    batch_insert_villages(cur, batch, country_id)
                    logger.info('Inserted final batch of %s villages', len(batch))

        logger.info('Import completed successfully')
    except Exception as exc:
        logger.exception('Import failed: %s', exc)
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    file_path = os.getenv('DATASET_PATH', 'india_villages.csv')
    run(file_path)
