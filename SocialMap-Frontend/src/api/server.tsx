import axios from 'axios'
import CONSTANTS from '../constants'

export default axios.create({
    baseURL: CONSTANTS.API_HOST
})