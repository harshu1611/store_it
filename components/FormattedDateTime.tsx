import { formatDateTime } from '@/lib/utils'
import React from 'react'

const FormattedDateTime = ({date,className}:{
    date:string, className?:string}) => {
  return (
    <p className={`body-1 text-light-200 ${className}`}>{formatDateTime(date)}</p>
)
}

export default FormattedDateTime