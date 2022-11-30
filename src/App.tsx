
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
  const [selected_spin_item, setSelectedSpinItem] = useState<number | null>(null);
  const [page_no, setPageNo] = useState(1)

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
    let start_time = new Date(spinner_data['start_time'])
    end_time.setSeconds(0)

    setTimerEndDate(end_time)
    setTimerStartDate(start_time)
    setWinnersData(winners_data);

    if (winners_data[selected_date.toLocaleDateString()]) {
      let curr_hour = new Date().getHours()
      if (winners_data[selected_date.toLocaleDateString()][curr_hour]) {
        let winners = winners_data[selected_date.toLocaleDateString()][curr_hour]['winners'];
        let wheel_items = [...spinner_data['items'], ...winners]
        console.log(winners);

        // setSelectedSpinItem(wheel_items.indexOf(winners[0]))
        setWheelItems(wheel_items)
      } else {
        setWheelItems(spinner_data['items']);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchSpinnerData();

  }, [])


  return (
    <div className='main'>

      {wheel_items && !loading && winners_data &&
        <>
          <div style={{ gap: "4rem", padding: "1rem 0" }} className='flex w-fit lg:gap-20 flex-row flex-wrap justify-center items-center mx-auto py-9'>
            <Wheel selected_item={selected_spin_item} onSelectItem={undefined} items={wheel_items}></Wheel>
            <CountDown on_Complete={fetchSpinnerData} start_date={timer_start_date} end_date={timer_end_date ? timer_end_date : new Date()} />
          </div>
          <div style={{ padding: "0 5rem" }} className='flex flex-col  '>
            <h2 className='text-white font-medium mx-auto text-center text-4xl'>Today Winners</h2>
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
                onClick={() => {
                  let cur_date = selected_date;
                  cur_date.setDate(cur_date.getDate() + 1);
                  console.log(cur_date);
                  console.log(winners_data[(cur_date.toLocaleDateString() as any)], cur_date.toLocaleDateString());
                  if (winners_data[(cur_date.toLocaleDateString() as any)] != undefined) {
                    setPageNo(page_no - 1)
                    setSelectedDate(cur_date)
                  }
                }}
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
                onClick={() => {
                  let cur_date = selected_date;
                  cur_date.setDate(cur_date.getDate() - 1);
                  console.log(winners_data[(cur_date.toLocaleDateString() as any)], cur_date.toLocaleDateString());
                  if (winners_data[(cur_date.toLocaleDateString() as any)] != undefined) {
                    setPageNo(page_no + 1)
                    setSelectedDate(cur_date)
                  }
                }}
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
                            console.log(current_winner_data);

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
