import path from 'path'
import { spin_hours, spin_minute, next_spin_delay } from '../../config.js'
import fs from 'fs'
const __dirname = path.resolve(path.dirname(''));

const winner_data_file_path = path.join(__dirname, 'winners_data.json');
const spinner_data_file_path = path.join(__dirname, 'spinner_data.json');

function randomItemSetter() {
    var no_of_winners_generated = 0
    let time_out = 1000 * 5 // 10 sec
    setInterval(() => {

        let date = new Date();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds()
        if (spin_hours.indexOf(hours) >= 0) {
            if (minutes === spin_minute) {
                const spinner_data_file = JSON.parse(fs.readFileSync(spinner_data_file_path));
                //* If no spinner data for today copy from yesterday's data.
                let today_spinner_data;
                let yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const today_date_str = new Date().toLocaleDateString();
                if (spinner_data_file[today_date_str]) {
                    today_spinner_data = JSON.parse(JSON.stringify(spinner_data_file[today_date_str]))
                } else {
                    today_spinner_data = JSON.parse(JSON.stringify(spinner_data_file[yesterday.toLocaleDateString()]));
                }

                if (today_spinner_data['items'].length < 3) {
                    console.warn("Insufficient spinner items, length < 3");
                    return;
                }

                //* Check if today spinner data is update in this hour
                let update_time = new Date(today_spinner_data['updated_at'])
                let spinner_items = today_spinner_data['items'];
                let new_spinner_data = spinner_data_file;
                if (!isNaN(update_time.getSeconds())) {
                    if (update_time.getHours() === hours && Math.abs(seconds - update_time.getSeconds()) >= next_spin_delay) {
                        today_spinner_data['items'] = spinner_items;
                        today_spinner_data['updated_at'] = new Date().toUTCString();
                        new_spinner_data[today_date_str] = today_spinner_data
                        fs.writeFileSync(spinner_data_file_path, JSON.stringify(new_spinner_data))
                        updateWinners()
                    }
                    else if (update_time.getHours() !== hours) {
                        console.log(seconds, update_time.getSeconds());
                        today_spinner_data['items'] = spinner_items;
                        today_spinner_data['updated_at'] = new Date().toUTCString();
                        new_spinner_data[today_date_str] = today_spinner_data
                        fs.writeFileSync(spinner_data_file_path, JSON.stringify(new_spinner_data))
                        updateWinners()
                    }
                }
                //* if no update_at field in spinner data
                else {
                    today_spinner_data['items'] = spinner_items;
                    today_spinner_data['updated_at'] = new Date().toUTCString();
                    new_spinner_data[today_date_str] = today_spinner_data
                    fs.writeFileSync(spinner_data_file_path, JSON.stringify(new_spinner_data))
                }
            }
        }
    }, time_out)
}


function updateWinners() {
    const winners_data_file = JSON.parse(fs.readFileSync(winner_data_file_path));
    const spinner_data_file = JSON.parse(fs.readFileSync(spinner_data_file_path));

    let date = new Date();
    let hours = date.getHours();

    const today_date_str = new Date().toLocaleDateString();

    //*selecting by date
    let today_winners_data = winners_data_file[today_date_str];
    //* new day for winners
    if (!today_winners_data) {
        today_winners_data = {}
    }

    //* Check if present hour winner is already generated
    let current_winners_data;
    if (!today_winners_data[hours]) {
        current_winners_data = {};
        current_winners_data['winners'] = [null, null, null];
    } else {
        current_winners_data = JSON.parse(JSON.stringify(today_winners_data[hours]))
    }

    for (let i = 0; i < current_winners_data['winners'].length; i++) {
        const winner = current_winners_data['winners'][i];
        if (winner == null) {
            const spinner_data_file = JSON.parse(fs.readFileSync(spinner_data_file_path));
            let yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            let today_spinner_data = JSON.parse(JSON.stringify(spinner_data_file[today_date_str]))
            
            let spinner_items = today_spinner_data['items'];
            let rand = Math.floor(Math.random() * spinner_items.length)
            current_winners_data['winners'][i] = spinner_items[rand]
            current_winners_data['updated_at'] = new Date().toLocaleTimeString();
            spinner_items.splice(rand, 1);

            today_winners_data[hours] = current_winners_data;
            let new_winners_data = winners_data_file;
            new_winners_data[today_date_str] = today_winners_data;

            
            fs.writeFileSync(winner_data_file_path, JSON.stringify(new_winners_data))
            break;
        }
    }
    console.log('hit ');
}

export default {
    randomItemSetter
}