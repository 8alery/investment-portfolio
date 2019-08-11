import { connect } from 'react-redux';
import { fetchBonds } from '../actions';

import Bonds from '../components/Bonds/Bonds';

const mapStateToProps = state => ({
  items: state.bonds.items,
  isLoading: state.bonds.isLoading
});

const mapDispatchToProps = dispatch => ({
  fetchBonds: () => dispatch(fetchBonds())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Bonds);
