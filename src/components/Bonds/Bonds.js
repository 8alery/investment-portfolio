import React from 'react';
import BondItem from './BondItem';

export default class Bonds extends React.Component {
  componentDidMount() {
    this.props.fetchBonds();
  }

  renderLoader() {
    return <div className="Bonds-Loader">Загрузка...</div>;
  }

  renderItems() {
    const { items } = this.props;
    return items.map(item => {
      return <BondItem className="Bonds-Item" item={item} />;
    });
  }

  render() {
    const { isLoading } = this.props;
    return (
      <div className="Bonds">
        {(isLoading && this.renderLoader()) || this.renderItems()}
      </div>
    );
  }
}
