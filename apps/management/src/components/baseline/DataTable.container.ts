import { connect } from 'react-redux';
import * as actions from '../../store/baselineData/baselineData.actions';
import * as selectors from '../../store/baselineData/baselineData.selectors';
import { DataTable } from './DataTable';
import { ReduxState } from '../../store/types';

const mapStateToProps = (state: ReduxState) => ({
  data: selectors.getSortedBaselineData(state),
  sortDir: selectors.getSortDir(state),
  sortCol: selectors.getSortCol(state),
});

const mapDispatchToProps = (dispatch: any) => ({
  onDeleteRow: () => {},
});

const container = connect(mapStateToProps, mapDispatchToProps)(DataTable);

export default container;
