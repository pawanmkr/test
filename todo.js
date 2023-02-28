const { Client } = require('pg')
const handleError = require('./handleError.js')

const db = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'datatoolkit',
    password: 'mint',
    port: 5432,
});

db.connect();

function wait(time) {
    return new Promise(resolve => {
      setTimeout(function() {
        resolve();
      }, time);
    });
}

async function distribute_rows() {
    try {

        // step 1: get total rows
        try {
            let row_count = await db.query(`
                select * from temp;
            `)
            row_count=row_count.rowCount()
        } catch (error) {
            handleError(error, "failed getting temp row count")
        }

        // step 2
        try {
            for (let id = 1; i <= row_count; id++) {
                
                // step 3
                let single_row, check_financed = true, check_has_insurance = true;
                try {
                    single_row = await db.query(`
                        select * from temp where id=$1;`, [id]
                    );
                    console.log(single_row)
                    
                    // check if financed or not
                    if (single_row.rows[0].financier_name == null) {
                        check_financed = false;
                    }

                    // check if insurance or not
                    if (single_row.rows[0].insurance_company == null) {
                        check_has_insurance = false;
                    }
                } catch (error) {
                    handleError(error, `failed adding single row for id: ${id}`)
                }

                // columns variable
                let 
                regno = single_row.rows[0].registration_no, 
                regdate = single_row.rows[0].registration_date, 
                owner_name = single_row.rows[0].owner_name, 
                father_name = single_row.rows[0].father_name, 
                chasis_no = single_row.rows[0].chasis_no, 
                engine_no = single_row.rows[0].engine_no, 
                permanent_address = single_row.rows[0].permanent_address, 
                vehicle_class = single_row.rows[0].vehicle_class, 
                seating_capacity = single_row.rows[0].seating_capacity,
                cubic_capacity = single_row.rows[0].cubic_capacity,
                manufacturer = single_row.rows[0].manufacturer,
                maker_model = single_row.rows[0].maker_model,
                fuel_type = single_row.rows[0].fuel_type,
                mobile = single_row.rows[0].mobile_no,
                financed = check_financed,
                has_insurance = check_has_insurance,

                insurance_type = single_row.rows[0].insurance_type,
                insurance_company = single_row.rows[0].insurance_company,
                from = single_row.rows[0].insurance_from,
                upto = single_row.rows[0].insurance_upto,
                policy_no = single_row.rows[0].policy_no,
                
                financier_name = single_row.rows[0].financier_name,
                financier_address = single_row.rows[0].financier_address,
                hypo_date = single_row.rows[0].hypothecation_date;

                // step 4: add row to usr table
                try {
                    const back = await db.query(`
                        insert into vehicle (
                            name,
                            father_name,
                            mobile_no,
                            permanent_address
                        )
                        values (
                            $1, $2, $3, $4
                        )
                        returning *;
                    `, [owner_name, father_name, mobile, permanent_address]
                    )
                    owner_id = back.rows[0].id;
                } catch (error) {
                    handleError(error, `failed adding row in user table`)
                }

                 // step 5: add rows to financier table
                try {
                    const back = await db.query(`
                        insert into financier (
                            name,
                            address,
                            hypothecation_date
                        )
                        values (
                            $1, $2, $3
                        )
                        returning *;
                    `, [financier_name, financier_address, hypo_date]
                    )
                    financier_id = back.rows[0].id;
                } catch (error) {
                    handleError(error, `failed adding row in financier table`)
                }

                // step 5: add rows to insurance table
                try {
                    const back = await db.query(`
                        insert into insurance (
                            company,
                            type,
                            insurance_from,
                            insurance_upto,
                            policy_no
                        )
                        values (
                            $1, $2, $3, $4, $5
                        )
                        returning *;
                    `, [insurance_company, insurance_type, from, upto, policy_no]
                    )
                    insurance_id = back.rows[0].id;
                } catch (error) {
                    handleError(error, `failed adding row in insurance table`)
                }

                // step 5: add rows to vehicle table
                try {
                    await db.query(`
                        insert into vehicle (
                            registration_no,
                            registration_date,
                            chasis_no,
                            engine_no,
                            vehicle_class,
                            fuel_type,
                            seating_capacity,
                            cubic_capacity,
                            manufacturer,
                            maker_model,
                            financed,
                            has_insurance,

                            owner,
                            financier,
                            insurance
                        )
                        values (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
                        )
                        returning *;
                    `, [
                            regno,
                            regdate,
                            chasis_no,
                            engine_no,
                            vehicle_class,
                            fuel_type,
                            seating_capacity,
                            cubic_capacity,
                            manufacturer,
                            maker_model,
                            financed,
                            has_insurance,

                            owner_id,
                            financier_id,
                            insurance_id
                        ]
                    )
                } catch (error) {
                    handleError(error, `failed adding row in vehicle table`)
                }
                wait(100000);
            }
        } catch (error) {
            handleError(error, "")
        }
    } catch (error) {
        handleError(error, "failed distributing rows")
    }
}

distribute_rows();