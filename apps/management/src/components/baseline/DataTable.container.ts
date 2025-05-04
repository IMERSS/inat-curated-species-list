import { connect } from 'react-redux';
import * as actions from '../../store/baselineData/baselineData.actions';
import * as selectors from '../../store/baselineData/baselineData.selectors';
import { DataTable } from './DataTable';
import { ReduxState } from '../../store/types';
import { SortCol, SortDir } from './BaselineData.types';

const mapStateToProps = (state: ReduxState) => ({
  data: selectors.getSortedBaselineData(state),
  sortDir: selectors.getSortDir(state),
  sortCol: selectors.getSortCol(state),
});

const mapDispatchToProps = (dispatch: any) => ({
  onSort: (sortCol: SortCol, sortDir: SortDir) => dispatch(actions.sortBaselineData(sortCol, sortDir)),
  onDeleteRow: () => {},
});

const container = connect(mapStateToProps, mapDispatchToProps)(DataTable);

export default container;
