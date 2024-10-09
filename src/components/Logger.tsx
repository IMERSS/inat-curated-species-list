import React, { useImperativeHandle, useState } from 'react';
import styles from './Logger.module.css';

type LogType = 'info' | 'error' | 'success';
type LogRow = [string, string];
let logRows: LogRow[] = [];

export const Logger = React.forwardRef((_props, ref) => {
  const [count, setCount] = useState(0);

  useImperativeHandle(
    ref,
    () => ({
      addLogRow: (str: string, logType: LogType) => {
        logRows = [...logRows, [str, logType]];
        setCount(count + 1);
        return logRows.length - 1;
      },
      addLogRows: (arr: LogRow[]) => {
        logRows = [...logRows, ...arr];
        setCount(count + 1);
      },
      replaceLogRow: (rowId: number, str: string, logType: LogType) => {
        const newData = [...logRows];
        newData[rowId] = [str, logType];
        logRows = newData;
        setCount(count + 1);
      },
      clear: () => {
        logRows = [];
        setCount(count + 1);
      },
    }),
    [count],
  );

  return (
    <div className={styles.logPanel} key={count}>
      <h3>Activity log</h3>

      {logRows.map(([log, logType], index) => (
        <div className={styles[logType]} dangerouslySetInnerHTML={{ __html: log }} key={index} />
      ))}
    </div>
  );
});

export default Logger;
