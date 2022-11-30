import express from 'express'
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import utils from './utils/index.js';
import { spin_hours, spin_minute } from '../config.js'

const app = express();
const __dirname = path.resolve(path.dirname(''));

utils.randomItemSetter()
app.use(express.json(), express.urlencoded({ extended: true }), cors())

app.get("/spinner-data", (req, res) => {
    const spinner_data = JSON.parse(fs.readFileSync(path.join(__dirname, 'spinner_data.json')))

    let current_time = new Date();
    let end_date = new Date();
    let end_hour = 12;

    if (current_time.getHours() > 21) {
        end_hour = (24 - current_time.getHours()) + spin_hours[0]
    } else {
        for (let i = 0; i < spin_hours.length; i++) {
            let diff = spin_hours[i] - current_time.getHours();
            if (diff >= 0) {
                if (diff === 0) {
                    if (current_time.getMinutes() <= spin_minute) {
                        end_hour = Math.min(end_hour, diff)
                    }
                }else{
                    end_hour = Math.min(end_hour, diff)
                }
            }
        }
    };

    end_date.setHours(current_time.getHours() + end_hour);
    end_date.setMinutes(spin_minute);

    let hours_diff = Math.abs(end_date.getHours() - current_time.getHours());
    if (hours_diff > 12) {
        hours_diff = hours_diff - 12;
    }
    let time_diff = ((end_date - current_time) / 1000)

    let minute_diff = (time_diff / 60) % 3600;

    console.log('hour ', hours_diff, "minute ", minute_diff, 'sec ', current_time.getSeconds());
    res.json({
        ...spinner_data, "current_time": {
            "hours": hours_diff,
            "minutes": minute_diff,
            "seconds": current_time.getSeconds()
        },
        "start_time": current_time,
        "end_time": end_date
    })
})

app.get('/winners-data', (req, res) => {
    const winner_data = JSON.parse(fs.readFileSync(path.join(__dirname, 'winners_data.json')))
    res.json(winner_data);
})

app.use('/', express.static(path.join(__dirname, 'build')))

const port = process.env['PORT'] || 8000
app.listen(port, function () {
    console.log('app listening at ', 'http://localhost:' + port);
});  
