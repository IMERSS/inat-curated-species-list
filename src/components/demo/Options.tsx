import React from 'react';

export const Options = () => {
  return (
    <>
      <label>Visible Ranks</label>
      <ColumnControls
        cols={orderedCols}
        visibleCols={visibleCols}
        onChange={onChange}
        downloadData={downloadData}
        allowDownload={allowDownload}
      />
      <label>Include species count</label>
      <label>Allow download data</label>
      <label>Include Latest additions tab</label>
    </>
  );
};
