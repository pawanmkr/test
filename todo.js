// distribution of data

// create a loop
// get one row from temp
// store data in particular table 

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

async function distribute_rows() {
    try {

        // step 1: get all rows
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
                let single_row;

                // columns variable
                let 
                regno, 
                regdate, 
                owner_name, 
                father_name, 
                chasis_no, 
                engine_no, 
                permanent_address, 
                vehicle_class, 
                seating_capacity,
                cubic_capacity,
                manufacturer,
                maker_model,
                fuel_type,
                mobile,

                insurance_type,
                insurance_company,
                from,
                upto,
                policy_no,
                
                financier_name,
                financier_address,
                hypo_date;

                try {
                    single_row = await db.query(`
                        select * from temp where id=$1;`, [id]
                    );
                    console.log(single_row)
                } catch (error) {
                    handleError(error, `failed adding single row for id: ${id}`)
                }

                // step 4: add row to usr table
                try {
                    await db.query(`
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
                } catch (error) {
                    handleError(
                        error, 
                        `failed adding row in usr table ${name}, 
                            ${father_name}, 
                            ${mobile}, 
                            ${permanent_address}`
                    )
                }

                 // step 5: add rows to financier table
                try {
                    await db.query(`
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
                } catch (error) {
                    handleError(
                        error, 
                        `failed adding row in financier table 
                            ${financier_name}, 
                            ${financier_address}, 
                            ${hypo_date}`
                    )
                }

                // step 5: add rows to insurance table
                try {
                    await db.query(`
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
                } catch (error) {
                    handleError(
                        error, 
                        `failed adding row in insurance table 
                            ${insurance_company}, 
                            ${insurance_type}, 
                            ${from},
                            ${upto},
                            ${policy_no}`
                    )
                }

                // step 5: add rows to vehicle table
                try {
                    await db.query(`
                        insert into vehicle (
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

                            owner,
                            financier,
                            insurance
                        )
                        values (
                            $1, $2, $3, $4, $5
                        )
                        returning *;
                    `, [insurance_company, insurance_type, from, upto, policy_no]
                    )
                } catch (error) {
                    handleError(
                        error, 
                        `failed adding row in insurance table 
                            ${insurance_company}, 
                            ${insurance_type}, 
                            ${from},
                            ${upto},
                            ${policy_no}`
                    )
                }
            }
        } catch (error) {
            handleError(error, "")
        }
    } catch (error) {
        handleError(error, "failed distributing rows")
    }
}