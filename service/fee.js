import axios from "axios"
import 'dotenv/config'

const branches = [
    {
        lat:10.762845975764886, 
        lng: 106.68248203041692,
        address: "227 Đ. Nguyễn Văn Cừ, Phường 4, Quận 5, Thành phố Hồ Chí Minh",
        name: "Chi nhánh Quận 5"
    },
    {
        lat: 10.71302862411907, 
        lng: 106.73690313761412,
        address: "1360 Huỳnh Tấn Phát, Phú Mỹ, Quận 7, Thành phố Hồ Chí Minh",
        name: "Chi nhánh Quận 7"
    }
]

export default class FeeService {
    async getFee(req) {
        try {
            const {lat, lng} = req.body
            let origin = "origins="
            for (var branch of branches) {
                origin += branch.lat + "," + branch.lng + "|"
            }
            origin = origin.slice(0, -1)
            const url = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&" + origin + "&destinations=" + lat + "," + lng + "&key=" + process.env.GOOGLE_API_KEY
            // use axios
            const response = await axios.get(url)
            if(response.status !== 200) {
                return {message: "Error when fetching data"}
            }
            const data = response.data
    
            // get the smallest distance
            let minDistance = Number.MAX_VALUE
            let minTime = Number.MAX_VALUE
            let minIndex = -1
            for (var i = 0; i < branches.length; i++) {
                if(data.rows[i].elements[0].status !== "OK") {
                    continue
                }
                const distance = data.rows[i].elements[0].distance.value
            
                if (distance < minDistance) {
                    minDistance = distance
                    minTime = data.rows[i].elements[0].duration.value
                    minIndex = i
                }
                else if (distance === minDistance) {
                    // compare duration
                    const duration = data.rows[i].elements[0].duration.value
                    if (duration < minTime) {
                        minTime = duration
                        minIndex = i
                    }
                }
            }
            if (minIndex === -1) {
                return {message: "No available branch"}
            }
            return {
                distance: minDistance,
                duration: minTime,
                branch: branches[minIndex]
            }
        }
        catch(error) {
            return {message: error.message}
        } 
    }
}
