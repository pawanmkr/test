const fs = require('fs')
const { Client } = require('pg')
const csv = require('csv-parser');
const ic = require('./ic.js')

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
var regarray=[]

function wait(time) {
    return new Promise(resolve => {
      setTimeout(function() {
        resolve();
      }, time);
    });
}

async function insert(ic) {
    for (const element of ic) {
        // await waitTwoSeconds(0)
        console.log(element)

        // extracted data from JSON / CSV
        let regno = element["Registration Number"]
        let insurance_type = element['Insurance Type']
        let company_name = element['Insurance Company Name']
        let from = element['Insurance From']
        let upto = element['Insurance Upto']
        let policy_no = element['Policy Number']

        // find the extracted data in db.table
        const single = await db.query(`
            select * from temp where registration_no = $1;
        `, [regno]);

        if (single.rowCount > 0) { // if exists then update insurance and policy data
            console.log(updatecount++)
            const updated = await db.query(`
                update temp 
                    set 
                        insurance_type = $1,
                        insurance_company = $2,
                        insurance_from = $3,
                        insurance_upto = $4,
                        policy_no = $5

                    where registration_no = $6 returning *;
            `, [insurance_type, company_name, from, upto, policy_no, single.rows[0].registration_no])
            // console.log(updated.rows[0])
        } else { // if doesn't exists then skip and count how many rows are different
            different++
            regarray.push[regno]
            console.log(regno)
            await wait(100)
        }
    }
    console.log("different: " + different)
    console.log(regarray)
}

insert(ic);














































/* const express = require('express');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    const jsdom = require("jsdom");
    const { JSDOM } = jsdom;

    const url = 'https://google.com';

    JSDOM.fromURL(url).then((dom) => {
        const document = dom.window.document;
        res.send(document.documentElement.outerHTML);
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`)); */