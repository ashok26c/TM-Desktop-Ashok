import {apiSlice} from "../app/api"

export const overViewApiSlice = apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        getTodayClockIn:builder.query({
            query:()=>(`/attendance/today-clockin`)
        }),
        getOwnAttendance:builder.query({
            query:()=>(`/attendance/get-own-attendance`)
        })
    })
})

export const { useGetOwnAttendanceQuery, useGetTodayClockInQuery } = overViewApiSlice