import * as json from 'json';
import * as time from 'time';
import * as requests from 'requests';


const PROJECT_TOKEN: string = "6b726c6050a6d13f2071561d8dfed59e";

interface Event {
    event: string;
    properties: {
        time: number;
        distinct_id: string;
        $insert_id: string;
        city: string;
    };
}

const events: Event[] = [
    {
        event: "my_test_event",
        properties: {
            time: time.time(),
            distinct_id: "test_user_1",
            $insert_id: "04ce0cf4-a633-4371-b665-9b45317b4976",
            city: "San Francisco"
        }
    },
    {
        event: "another_event",
        properties: {
            time: time.time(),
            distinct_id: "test_user_2",
            $insert_id: "3b033b9a-6bc9-4b70-90c3-a53e11f6896e",
            city: "Seattle"
        }
    }
];

const resp = requests.post(
    "https://api.mixpanel.com/import",
    { strict: "1" },
    { auth: { username: PROJECT_TOKEN, password: "" } },
    { headers: { "Content-Type": "application/json" }, data: json.dumps(events) }
);

console.log(resp.json());