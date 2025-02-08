// Function to create the table if it doesn't exist
import bcrypt from 'bcrypt';

import { init_admin, provinces_data, banks_data } from "./init_data";

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // Recommended number of salt rounds
  return await bcrypt.hash(password, saltRounds);
}

async function checkAndInsertUser(client: any) {
  try {
    // Start a transaction
    await client.query('BEGIN');
    
    const result = await client.query('SELECT COUNT(*) FROM "user"');
    const userCount = parseInt(result.rows[0].count, 10);

    if (userCount === 0) {
      const hashedPassword = await hashPassword('adminpassword'); // Replace with your actual password

      const query = `
                      INSERT INTO "user" (
                          username, password, display_name, email, address, roles, is_active, last_access, created_at, updated_at
                      ) VALUES (
                          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
                      )
                    `;

        const values = [
            init_admin.username,
            init_admin.password,
            init_admin.display_name,
            init_admin.email,
            '123 Admin Street',
            JSON.stringify(init_admin.roles),
            true,
            new Date(),
            new Date(),
            new Date()
        ];

        await client.query(query, values);
        console.log('Admin user created successfully');
    } else {
        console.log('User table is not empty; no action taken.');
    }

    // Commit the transaction
    await client.query('COMMIT');
  } catch (error) {
    // Rollback the transaction in case of an error
    await client.query('ROLLBACK');

    console.error('Error checking or inserting data:', error);
  } 
}

async function checkAndInsertBanks(client: any) {
  try {
    // Start a transaction
    await client.query('BEGIN');

    // Check if the table is empty
    const result = await client.query('SELECT COUNT(*) FROM bank;');
    const count = parseInt(result.rows[0].count, 10);

    if (count === 0) {
      console.log('Table is empty. Inserting bank data...');
      
      // Insert banks_data into the table
      const insertQuery = `
        INSERT INTO bank (name_th, name_en)
        VALUES ($1, $2)
        RETURNING id;
      `;
      for (const bank of banks_data) {
        const res = await client.query(insertQuery, [bank.name_th, bank.name_en]);
        console.log(`Inserted bank with ID: ${res.rows[0].id}`);
      }
      console.log('Bank created successfully');
    } else {
      console.log('Table is not empty. Skipping data bank insertion.');
    }

    // Commit the transaction
    await client.query('COMMIT');

  } catch (error) {
    // Rollback the transaction in case of an error
    await client.query('ROLLBACK');

    console.error('Error checking or inserting data:', error);
  } 
}

async function checkAndInsertProvinces(client: any) {
  try {
    // Start a transaction
    await client.query('BEGIN');

    // Step 1: Check if the province table is empty
    const result = await client.query('SELECT COUNT(*) FROM province;');
    const count = parseInt(result.rows[0].count, 10);

    if (count === 0) {
      console.log("Table is empty. Inserting province data...");

      // Insert banks_data into the table
      const insertQuery = `
        INSERT INTO province (name_th, name_en)
        VALUES ($1, $2)
        RETURNING id;
      `;

      for (const province of provinces_data) {
        const res = await client.query(insertQuery, [province.value, province.label]);
        console.log(`Inserted bank with ID: ${res.rows[0].id}`);
      }
      
      console.log("Provinces created successfully");
    } else {
      console.log("Table already contains data province. No action taken.");
    }

    // Commit the transaction
    await client.query('COMMIT');
  } catch (error) {
    // Rollback the transaction in case of an error
    await client.query('ROLLBACK');

    console.error("Error populating provinces:", error);
  }
}

export const createTable = async (client: any) => {
    const sql_table_user = `
  CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY, -- Auto-incrementing ID
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    address TEXT,
    roles JSON DEFAULT '[\"1\"]',             -- Default to "AUTHENTICATED" role (assuming 1 is for AUTHENTICATED)
    is_active BOOLEAN DEFAULT FALSE,           -- TRUE or FALSE
    avatar_id INTEGER,                         -- Assuming avatarId is a reference to another table
    -- lockAccount_lock BOOLEAN DEFAULT FALSE,   -- TRUE or FALSE
    -- lockAccount_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_access TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "user_revision" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    username VARCHAR(255),
    password VARCHAR(255),
    email VARCHAR(255),
    display_name VARCHAR(255),
    address TEXT,
    roles JSON,
    is_active BOOLEAN,
    avatar_id INTEGER,
    -- lockAccount_lock BOOLEAN,
    -- lockAccount_date TIMESTAMP,
    last_access TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE OR REPLACE FUNCTION log_user_revision() 
  RETURNS TRIGGER AS $$
  BEGIN
      -- Insert old values into user_revision table before the update
      INSERT INTO "user_revision" (
          user_id,
          username,
          password,
          email,
          display_name,
          address,
          roles,
          is_active,
          avatar_id,
          -- lockAccount_lock,
          -- lockAccount_date,
          last_access,
          created_at,
          updated_at
      )
      VALUES (
          NEW.id,
          OLD.username,
          OLD.password,
          OLD.email,
          OLD.display_name,
          OLD.address,
          OLD.roles,
          OLD.is_active,
          OLD.avatar_id,
          -- OLD.lockAccount_lock,
          -- OLD.lockAccount_date,
          OLD.last_access,
          OLD.created_at,
          OLD.updated_at
      );

      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Drop the trigger if it already exists
  DO $$
  BEGIN
      IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_user_revision') THEN
          DROP TRIGGER trigger_user_revision ON "user";
      END IF;
  END $$;

  -- Create the trigger for after an update on the user table
  CREATE TRIGGER trigger_user_revision
  AFTER UPDATE ON "user"
  FOR EACH ROW
  EXECUTE FUNCTION log_user_revision();
  --- script backup auto to user_revision table
`;

  const sql_table_follow = `
    CREATE TABLE IF NOT EXISTS follow (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      follower_id INTEGER NOT NULL,
      CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
      CONSTRAINT fk_follower FOREIGN KEY (follower_id) REFERENCES "user"(id) ON DELETE CASCADE
    );
  `;

  const sql_table_bank = `
  CREATE TABLE IF NOT EXISTS bank (
    id SERIAL PRIMARY KEY, -- Auto-incrementing ID
    name_th VARCHAR(255) NOT NULL, -- Name in Thai, required
    name_en VARCHAR(255) NOT NULL, -- Name in English, required
    description TEXT, -- Optional field for description
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically set when a row is created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Automatically set when a row is updated
  );
  `

  const sql_table_comment = `
-- Create an ENUM type (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_enum') THEN
        CREATE TYPE status_enum AS ENUM ('SENDING', 'SENT', 'FAILED');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_comment (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    username VARCHAR NOT NULL,
    url VARCHAR DEFAULT ''
);

CREATE TABLE IF NOT EXISTS comment (
    id SERIAL PRIMARY KEY,
    report_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sub_comment (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    user_id INT NOT NULL,
    status status_enum NOT NULL DEFAULT 'SENDING',
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    -- Foreign Key Reference
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES user_comment(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comment_data (
    id SERIAL PRIMARY KEY,
    comment_id INT NOT NULL,
    text TEXT NOT NULL,
    user_id INT NOT NULL,
    status status_enum NOT NULL DEFAULT 'SENDING',
    created BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    -- Foreign Key References
    CONSTRAINT fk_comment_id FOREIGN KEY (comment_id) REFERENCES comment(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_comment_id FOREIGN KEY (user_id) REFERENCES user_comment(id) ON DELETE CASCADE
);
`;

    const sql_table_dblog = `
  CREATE TABLE IF NOT EXISTS dblog (
    id SERIAL PRIMARY KEY, -- Auto-incrementing unique identifier for each log
    level VARCHAR(255) NOT NULL, -- String field for the log level
    meta JSONB NOT NULL, -- JSON field for dynamic objects
    message JSONB NOT NULL, -- JSON field for message
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp field with default as the current time
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically managed by Sequelize's timestamps
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Automatically managed by Sequelize's timestamps
  );`;

    const sql_table_file = `
  CREATE TABLE IF NOT EXISTS file (
    id SERIAL PRIMARY KEY, -- Auto-incrementing primary key for the file record
    user_id INTEGER NOT NULL REFERENCES "user" (id) ON DELETE CASCADE, -- Foreign key reference to the User table
    url TEXT, -- URL for the file (nullable)
    filename TEXT, -- Name of the file (nullable)
    mimetype TEXT, -- MIME type of the file (nullable)
    encoding TEXT, -- Encoding of the file (nullable)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically stores the creation timestamp
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Automatically updates on modification
  );`;

    const sql_table_log_user_access = `
  CREATE TABLE IF NOT EXISTS log_user_access (
      id SERIAL PRIMARY KEY, -- Auto-increment ID
      websocket_key VARCHAR(255) NOT NULL, -- String field for websocketKey
      user_id BIGINT NOT NULL, -- Foreign key to user table
      request JSONB, -- Using JSONB for flexible data storage
      connect_time TIMESTAMP DEFAULT NULL,
      disconnect_time TIMESTAMP DEFAULT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      -- FOREIGN KEY (user_id) REFERENCES "user"(id) -- Assuming a 'user' table exists
  );
  `;

    const sql_table_position = `
  CREATE TABLE IF NOT EXISTS position (
    id CHAR(24) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    percent FLOAT DEFAULT NULL,
    budget FLOAT DEFAULT NULL,
    level INT DEFAULT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
  );`;

    const sql_table_province = `
  CREATE TABLE IF NOT EXISTS province (
    id SERIAL PRIMARY KEY, -- Auto-incrementing ID
    name_th VARCHAR(255) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
  );
  `;

    const sql_table_report = `
  CREATE TABLE IF NOT EXISTS report (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES "user" (id) ON DELETE CASCADE, -- Foreign key reference to the User table
      seller_first_name VARCHAR(255) NOT NULL,
      seller_last_name VARCHAR(255) NOT NULL,
      id_card VARCHAR(13) NOT NULL CHECK (LENGTH(id_card) = 13),
      product VARCHAR(255) NOT NULL,
      transfer_amount NUMERIC(10, 2) NOT NULL,
      transfer_date TIMESTAMP NOT NULL,
      selling_website VARCHAR(255) NOT NULL,
      province_id INT NOT NULL,
      additional_info TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
  );
    `;

    const sql_table_seller_account = `
  CREATE TABLE IF NOT EXISTS seller_account (
      id SERIAL PRIMARY KEY,
      report_id INT NOT NULL,
      seller_account VARCHAR(255) NOT NULL,
      bank_id INT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES report (id) 
  );
    `

    const sql_table_tel_numbers = `
  CREATE TABLE IF NOT EXISTS tel_numbers (
      id SERIAL PRIMARY KEY,
      report_id INT NOT NULL,
      tel VARCHAR(50) NOT NULL,
      FOREIGN KEY (report_id) REFERENCES report (id) 
  );
     `

    const sql_table_likes = `
  CREATE TABLE IF NOT EXISTS likes (
      id SERIAL PRIMARY KEY,
      report_id INT NOT NULL,
      user_id INT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES report (id) 
  );
     `

     const sql_table_report_images = `
  CREATE TABLE IF NOT EXISTS report_images (
      id SERIAL PRIMARY KEY,
      report_id INT NOT NULL,
      file_id INT NOT NULL
      -- FOREIGN KEY (report_id) REFERENCES report (id) ,
      -- FOREIGN KEY (file_id) REFERENCES File (id) 
  );
     `

    const sql_table_session = `
  CREATE TABLE IF NOT EXISTS session (
    id SERIAL PRIMARY KEY, -- Auto-incrementing ID
    user_id INTEGER NOT NULL REFERENCES "user"(id), -- Assuming User table has a UUID as its primary key
    token TEXT NOT NULL, -- Token stored as a text
    device_agent TEXT, -- Optional device agent
    expired TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '30 days', -- Expiry date defaulting to 30 days
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically sets on insert
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Updates on row update
  );
  `;

    const sql_table_socket = `
  CREATE TABLE IF NOT EXISTS socket (
    id SERIAL PRIMARY KEY,
    socket_id VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `;

    const sql_table_schema_version = `
  -- Create table for schema version tracking
  CREATE TABLE IF NOT EXISTS "schema_version" (
    "id" SERIAL PRIMARY KEY,
    "table_name" VARCHAR(255) NOT NULL UNIQUE,
    "version" INTEGER DEFAULT 0
  );`

  try {
    //   await client.query(initialTableQuery);
    //   console.log('Table created (or already exists)');
    //   client.release(); // Release the client back to the pool

    // Execute the initial table creation
    await client.query(sql_table_user);
    await client.query(sql_table_follow);
    await client.query(sql_table_bank);
    await client.query(sql_table_comment);
    await client.query(sql_table_dblog);
    await client.query(sql_table_file);
    await client.query(sql_table_log_user_access);
    await client.query(sql_table_position);
    await client.query(sql_table_province);
    await client.query(sql_table_report);
    await client.query(sql_table_seller_account);
    await client.query(sql_table_tel_numbers);
    await client.query(sql_table_likes);
    await client.query(sql_table_report_images);
    await client.query(sql_table_session);
    await client.query(sql_table_socket);
    await client.query(sql_table_schema_version);

    console.log('Tables created (or already exist)');
    // Check the schema version
    const versionCheckQuery = `
      SELECT version FROM schema_version WHERE table_name = 'user';
    `;
    const versionResult = await client.query(versionCheckQuery);

    // Get the current version or set it to 0
    let currentVersion = 0;
    if (versionResult.rows.length > 0) {
      currentVersion = versionResult.rows[0].version;
    }

    // Target schema version (increment as needed when altering the schema)
    const targetVersion = 0;

    if (currentVersion < targetVersion) {
      // Apply schema updates based on version
      if (currentVersion === 1) {
        console.log('Applying version 1 updates...');
        //  await client.query(`
        //    ALTER TABLE user ADD COLUMN "newField1" VARCHAR(255) DEFAULT NULL;
        //  `);
      }

      if (currentVersion === 2) {
        console.log('Applying version 2 updates...');
        //  await client.query(`
        //    ALTER TABLE user ADD COLUMN "newField2" BOOLEAN DEFAULT TRUE;
        //  `);
      }

      // Update the schema version
      const updateVersionQuery = `
        INSERT INTO schema_version (table_name, version)
        VALUES ('user', $1)
        ON CONFLICT (table_name) DO UPDATE SET version = $1;
      `;
      await client.query(updateVersionQuery, [targetVersion]);
    }

    // admin
    await checkAndInsertUser(client);
    // bank 
    await checkAndInsertBanks(client);
    // province
    await checkAndInsertProvinces(client);
    console.log('Schema is up-to-date.');

  } catch (error) {
    console.error('Error creating table', error);
  } finally{
    // client.release();
  }
};