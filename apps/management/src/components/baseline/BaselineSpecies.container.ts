import { connect } from 'react-redux';
import * as actions from '../../store/baselineData/baselineData.actions';
import * as selectors from '../../store/baselineData/baselineData.selectors';
import { BaselineSpecies } from './BaselineSpecies';
import { ReduxState } from '../../store/types';

const mapStateToProps = (state: ReduxState) => ({
  data: selectors.getSortedBaselineData(state),
  isLoading: selectors.isLoading(state),
  isLoaded: selectors.isLoaded(state),
});

const mapDispatchToProps = (dispatch: any) => ({
  loadBaselineData: async () => dispatch(actions.loadBaselineData()),
  saveBaselineData: (data: any) => dispatch(actions.saveBaselineData(data)),
});

const container = connect(mapStateToProps, mapDispatchToProps)(BaselineSpecies);

export default container;
