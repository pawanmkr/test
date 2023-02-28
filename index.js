const { Client } = require('pg')
const csv = require('csv-parser');
const hp = require('./hp.js')

const db = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'datatoolkit',
    password: 'mint',
    port: 5432,
});

db.connect();

let rowcount=0;
var updatecount=0;
var different=0;

function wait(time) {
    return new Promise(resolve => {
      setTimeout(function() {
        resolve();
      }, time);
    });
}

async function insert(hp) {
    for (const element of hp) {
        // await waitTwoSeconds(0)
        console.log(element)

        // extracted data from JSON / CSV
        let regno = element["Registration No"]
        let financier_name = element['Financier Name']
        let financier_address = element['Financier Address']
        let hypo_date = element['Hypothecation date']

        // find the extracted data in db.table
        const single = await db.query(`
            select * from temp where registration_no = $1;
        `, [regno]);

        if (single.rowCount > 0) { // if exists then update insurance and policy data
            console.log(updatecount++)
            const updated = await db.query(`
                update temp 
                    set 
                        financier_name = $1,
                        financier_address = $2,
                        hypothecation_date = $3

                    where registration_no = $4 returning *;
            `, [financier_name, financier_address, hypo_date, single.rows[0].registration_no])
            console.log(updated.rows[0])
        } else { // if doesn't exists then skip and count how many rows are different
            different++
            console.log(regno)
            await wait(100)
        }
    }
    console.log("different: " + different)
}

insert(hp);