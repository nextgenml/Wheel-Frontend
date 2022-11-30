import path from 'path'
import { spin_hours, spin_minute } from '../../config.js'
import fs from 'fs'
const __dirname = path.resolve(path.dirname(''));

const winner_data_file_path = path.join(__dirname, 'winners_data.json');
const spinner_data_file_path = path.join(__dirname, 'spinner_data.json');

function randomItemSetter() {
    var no_of_winners_generated = 0
    let time_out = 1000 * 1 // 10 sec
    setInterval(() => {
        let date = new Date();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        if (spin_hours.indexOf(hours) >= 0) {
            if (minutes === spin_minute) {
                var winners_data_file = JSON.parse(fs.readFileSync(winner_data_file_path))
                const today_date_str = new Date().toLocaleDateString();
                let today_winners_data = winners_data_file[today_date_str];
                //* new day for winners
                if (!today_winners_data) {
                    today_winners_data = {}
                }

                let current_winners_data = today_winners_data[hours];
                if (current_winners_data !== undefined) {
                    return;
                }
                current_winners_data = {};

                let spinner_data_file = JSON.parse(fs.readFileSync(spinner_data_file_path));

                let today_spinner_data = (spinner_data_file[today_date_str]);

                //* If no spinner data for today copy from yesterday's data.
                let yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (today_spinner_data == undefined) {
                    console.log('no spinner data');
                    today_spinner_data = JSON.parse(JSON.stringify(spinner_data_file[yesterday.toLocaleDateString()]));
                    console.log(today_spinner_data);
                }

                let spinner_items = today_spinner_data['items'];
                if (spinner_items.length < 3) {
                    console.warn("Insufficient spinner items, length < 3");
                    return;
                }
                current_winners_data['winners'] = [null, null, null];

                let random_winners = new Array(3).fill(null)

                for (let i = 0; i < 3; i++) {
                    let rand = Math.floor(Math.random() * spinner_items.length)
                    random_winners[i] = spinner_items[rand];
                    //* deleting winner form list
                    spinner_items.splice(rand, 1);
                    console.log(spinner_items.length);
                }
                console.log('prev items');
                console.log(spinner_data_file[yesterday.toLocaleDateString()]['items'].toString());
                console.log(spinner_data_file[yesterday.toLocaleDateString()]['items'].length);
                current_winners_data['updated_at'] = new Date().toLocaleTimeString();
                current_winners_data['winners'] = random_winners

                today_winners_data[hours] = current_winners_data;
                let new_winners_data = winners_data_file;
                new_winners_data[today_date_str] = today_winners_data;

                today_spinner_data['items'] = spinner_items
                let new_spinner_data = spinner_data_file;
                console.log(yesterday.toLocaleDateString());
                console.log(today_date_str);
                fs.writeFileSync(winner_data_file_path, JSON.stringify(new_winners_data))
                fs.writeFileSync(spinner_data_file_path, JSON.stringify(new_spinner_data))
                return;
            }
        }
    }, time_out, no_of_winners_generated)
}
export default {
    randomItemSetter
}