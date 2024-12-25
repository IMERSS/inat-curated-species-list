import React, { useImperativeHandle, useState } from 'react';
import styles from './Logger.module.css';
import { LogRow, LoggerHandle } from '../../types/internal';

let logRows: LogRow[] = [];

export const Logger = React.forwardRef<LoggerHandle, unknown>((_props, ref) => {
  const [count, setCount] = useState(0);

  useImperativeHandle(
    ref,
    () => ({
      addLogRow: (str, logType) => {
        logRows = [...logRows, [str, logType]];
        setCount(count + 1);
        return logRows.length - 1;
      },
      addLogRows: (arr) => {
        logRows = [...logRows, ...arr];
        setCount(count + 1);
      },
      replaceLogRow: (rowId, str, logType) => {
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
