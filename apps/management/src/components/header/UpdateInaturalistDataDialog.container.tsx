import { connect } from 'react-redux';
import { requestInatObservations } from '../../store/main/main.actions';
import * as selectors from '../../store/main/main.selectors';
import { UpdateInaturalistDataDialog } from './UpdateInaturalistDataDialog';
import { ReduxState } from '../../store/types';

const mapStateToProps = (state: ReduxState) => ({
  isActive: selectors.isInatObsDataRequestActive(state),
  placeId: selectors.getPlaceId(state),
  taxonId: selectors.getTaxonId(state),
  curators: selectors.getCurators(state),
});

const mapDispatchToProps = { requestInatObservations };

const mergeProps = (stateProps: any, dispatchProps: any, ownProps: any) => {
  const { isActive, placeId, taxonId, curators } = stateProps;

  return {
    isActive,
    startSync: () => dispatchProps.requestInatObservations({ placeId, taxonId, curators }),
    ...ownProps,
  };
};

const container = connect(mapStateToProps, mapDispatchToProps, mergeProps)(UpdateInaturalistDataDialog);

export default container;
