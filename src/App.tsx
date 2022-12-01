
import { useEffect, useState } from 'react';
import Wheel from './components/wheel';
import CountDown from './components/countdown';
import { spin_hour_1, spin_hour_2, spin_minute } from './config';

function App() {
  var api_url = '/'
  if (process.env['NODE_ENV'] === 'development') {
    api_url = 'http://0.0.0.0:8000/'
  }

  const [loading, setLoading] = useState(true);
  const [wheel_items, setWheelItems] = useState<any[] | undefined>(undefined);
  const [winners_data, setWinnersData] = useState<[] | undefined>(undefined);
  const [timer_end_date, setTimerEndDate] = useState<Date>();
  const [timer_start_date, setTimerStartDate] = useState<Date>(new Date());
  const [selected_date, setSelectedDate] = useState<Date>(new Date());
  const [winner, setWinner] = useState<number | null>(null);
  const [page_no, setPageNo] = useState(1)
  const [show_spin_button, stShowSpinButton] = useState(false);
  const setSpinnerData = (_selected_date: Date) => {
    const spinner_data = JSON.parse(localStorage.getItem("spinner_data")!);
    const winners_data = JSON.parse(localStorage.getItem("winners_data")!);
    let winners_data_dates = Object.keys(winners_data);//*Automatically sorts
    let spinner_data_dates = Object.keys(spinner_data);

    let curr_winners = winners_data[_selected_date.toLocaleDateString()]
    let wheel_items = spinner_data[_selected_date.toLocaleDateString()]['items'] as string[];
    if (!curr_winners) {
      curr_winners = winners_data[winners_data_dates[winners_data_dates.length - 1]]
    }
    
    let curr_hour = _selected_date.getHours();
    //* Adding all winners into the wheel
    if (curr_winners) {
      let last_hour = '0';
      for (const hour in curr_winners) {
        wheel_items.push(...curr_winners[hour]['winners'].filter((e: string) => e != null));
        last_hour = hour;
      }

      let winners = winners_data[_selected_date.toLocaleDateString()][last_hour]['winners'] as string[];
      winners = winners.filter(e => e != null);
      setWinner(wheel_items.indexOf(winners[winners.length - 1]))
      setWheelItems(wheel_items)
    } else {
      setWheelItems(spinner_data[_selected_date.toLocaleDateString()]['items']);
    }

  }

  const fetchSpinnerData = async () => {

    let spinner_data_res = await fetch(api_url + "spinner-data", {
      method: "GET",
      headers: {
        'Content-Type': "application/json"
      }
    })
    let spinner_data = await spinner_data_res.json();

    let winners_data_res = await fetch(api_url + "winners-data", {
      method: "GET",
      headers: {
        'Content-Type': "application/json"
      }
    })
    let winners_data = await winners_data_res.json();

    let end_time = new Date(spinner_data['end_time']);
    let start_time = new Date(spinner_data['start_time']);

    localStorage.setItem('spinner_data', JSON.stringify(spinner_data));
    localStorage.setItem("winners_data", JSON.stringify(winners_data));
    setSpinnerData(start_time);
console.log(start_time , end_time);

    setTimerEndDate(end_time)
    setTimerStartDate(start_time)
    setWinnersData(winners_data);
    setSelectedDate(start_time);
    setLoading(false);
  }

  const handlePrevDate = () => {
    let cur_date = new Date(selected_date.toString());
    cur_date.setDate(cur_date.getDate() - 1);
    if (winners_data && winners_data && (cur_date.toLocaleDateString()  in winners_data)) {
      console.log('prev day', cur_date.toLocaleDateString() );
      setPageNo(page_no + 1)
      setSelectedDate(cur_date)
      setSpinnerData(cur_date)
    } else {
      alert("No previous records found")
    }
  }

  const handleNextDate = () => {
    let cur_date = new Date(selected_date.toString());
    cur_date.setDate(cur_date.getDate() + 1);
    console.log(winners_data);

    
    if (winners_data && winners_data && (cur_date.toLocaleDateString()  in winners_data)) {
      console.log('next day', cur_date.toLocaleDateString() );
      setPageNo(page_no - 1)
      setSelectedDate(cur_date)
      setSpinnerData(cur_date)
    } else {
      alert("You are at present date.")
    }
  }

  useEffect(() => {
    fetchSpinnerData();

  }, [])


  return (
    <div className='main'>

      {wheel_items && !loading && winners_data &&
        <>
          <div style={{ gap: "4rem", padding: "1rem 0" }} className='flex w-fit lg:gap-20 flex-row flex-wrap justify-center items-center mx-auto py-9'>
            <Wheel selected_item={winner} items={wheel_items}></Wheel>
            <CountDown on_Complete={fetchSpinnerData} start_date={timer_start_date} end_date={timer_end_date ? timer_end_date : new Date()} />
          </div>
          <div style={{ padding: "0 5rem" }} className='flex flex-col  '>
            {show_spin_button &&
              <button style={{ marginBottom: "1rem" }}
                className='inline-block px-6 py-2 border-2 border-blue-400 text-blue-400 font-medium text-xs leading-tight uppercase rounded-full hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out w-fit self-center my-10'
                onClick={fetchSpinnerData}>Spin</button>
            }
            {!show_spin_button &&
              <button
                type="button"
                style={{ marginBottom: "1rem", cursor: "not-allowed" }}
                className="w-fit inline-block px-6 py-2 border-2 border-gray-600 text-gray-400 font-medium text-xs leading-tight uppercase rounded-full hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out w-fit self-center my-10 ">
                Spin
              </button>
            }
            <h2 className='text-white font-medium mx-auto  text-center text-4xl'>Today Winners</h2>
            <div className='flex flex-row  items-center w-fit ml-auto gap-4'>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={35}
                height={35}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                onClick={handleNextDate}
                className="cursor-pointer feather feather-chevron-left"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <p className='font-medium text-white'>{page_no}</p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={35}
                height={35}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                onClick={handlePrevDate}
                className="cursor-pointer feather feather-chevron-right"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
          {/* Table */}
          <div className="w-[100%] flex flex-col">
            <div className="sm:mx-6 lg:mx-8 ">
              <div className="py-4 inline-block min-w-full sm:px-6 lg:px-8">
                <div className="overflow-hidden ">
                  <table className="min-w-full text-center ">
                    <thead className="border-b bg-gray-800">
                      <tr>
                        <th
                          scope="col"
                          className="text-sm font-medium text-white px-6 py-4"
                        >
                          {selected_date.toLocaleDateString().replaceAll("/", '-')}
                        </th>
                        <th
                          scope="col"
                          className="text-sm font-medium text-white px-6 py-4"
                        >
                          First Winner
                        </th>
                        <th
                          scope="col"
                          className="text-sm font-medium text-white px-6 py-4"
                        >
                          Second Winner
                        </th>
                        <th
                          scope="col"
                          className="text-sm font-medium text-white px-6 py-4"
                        >
                          Third Winner
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(winners_data[(selected_date.toLocaleDateString() as any)]) &&
                        Object.keys((winners_data[(selected_date.toLocaleDateString() as any)]))
                          .map((hour: any) => {
                            let current_time = hour;
                            let current_winner_data = winners_data[(selected_date.toLocaleDateString() as any)][hour]
                            if (hour > 12) {
                              current_time = hour + " : " + 15 + "PM"
                            } else {
                              current_time = hour + " : " + 15 + "AM"
                            }
                            return (
                              <tr className="bg-gray-500 border-b border-gray-500">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                                  {current_time}
                                </td>
                                {
                                  (current_winner_data['winners'] as string[]).map((winner_item: any) => {
                                    return <td className="text-sm text-gray-100 font-light px-6 py-4 whitespace-nowrap">
                                      {winner_item}
                                    </td>
                                  })
                                }
                              </tr>)
                          })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      }

      {loading &&
        <div style={{ backgroundColor: "#3caeee", position: 'absolute', top: '50%', left: '50%' }} className="spinner-grow inline-block w-12 h-12  rounded-full opacity-0" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      }
    </div>
  );
}

export default App;
