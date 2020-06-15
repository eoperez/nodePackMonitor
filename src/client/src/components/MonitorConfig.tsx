import React, { ReactElement} from 'react'
import { IPort } from "./ConfigPeek";
// import axios from 'axios'

import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText
} from '@material-ui/core'

interface Props {
    ports: Array<IPort> | undefined;
 }

export default function MonitorConfig(props: Props): ReactElement {
    return (
        <FormControl>
            <InputLabel id="demo-simple-select-autowidth-label">Inverter Port</InputLabel>
            <Select
                labelId="demo-simple-select-autowidth-label"
                id="demo-simple-select-autowidth"
                autoWidth
            >
                <MenuItem value=""></MenuItem>
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
            </Select>
            <FormHelperText>Please select monitor communication Port.</FormHelperText>
        </FormControl>
    )
}