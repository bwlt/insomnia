// @flow
import * as React from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';

type Props = {
  onSubmit: (value: string) => mixed,
  value: string,
  // eslint-disable-next-line no-use-before-define
  renderReadView?: (value: string, readViewProps: ReadViewProps) => React.Node,
  singleClick?: boolean,
  onEditStart?: () => mixed,
  className?: string,
}
type State = {
  editing: boolean,
}
type ReadViewProps = $Diff<Props, { value: * }> & {
  className?: string,
  title: string,
  onClick: () => mixed,
  onDoubleClick: () => mixed,
}

@autobind
class Editable extends React.PureComponent<Props, State> {
  _input: null | HTMLInputElement

  constructor (props: Props) {
    super(props);
    this.state = {
      editing: false
    };
  }

  _handleSetInputRef (n: null | HTMLInputElement) {
    this._input = n;
  }

  _handleSingleClickEditStart () {
    if (this.props.singleClick) {
      this._handleEditStart();
    }
  }

  _handleEditStart () {
    this.setState({editing: true});

    setTimeout(() => {
      this._input && this._input.focus();
      this._input && this._input.select();
    });

    if (this.props.onEditStart) {
      this.props.onEditStart();
    }
  }

  _handleEditEnd () {
    const {_input} = this;
    if (!_input) {
      return;
    }
    const value = _input.value.trim();

    if (!value) {
      // Don't do anything if it's empty
      return;
    }

    this.props.onSubmit(value);

    // This timeout prevents the UI from showing the old value after submit.
    // It should give the UI enough time to redraw the new value.
    setTimeout(async () => this.setState({editing: false}), 100);
  }

  _handleEditKeyDown (e: SyntheticKeyboardEvent<HTMLElement>) {
    if (e.keyCode === 13) {
      // Pressed Enter
      this._handleEditEnd();
    } else if (e.keyCode === 27) {
      // Pressed Escape
      // NOTE: This blur causes a save because we save on blur
      // TODO: Make escape blur without saving
      this._input && this._input.blur();
    }
  }

  render () {
    const {
      value,
      singleClick,
      onEditStart, // eslint-disable-line no-unused-vars
      className,
      renderReadView,
      ...extra
    } = this.props;
    const {editing} = this.state;

    if (editing) {
      return (
        <input {...extra}
               className={`editable ${className || ''}`}
               type="text"
               ref={this._handleSetInputRef}
               defaultValue={value}
               onKeyDown={this._handleEditKeyDown}
               onBlur={this._handleEditEnd}
        />
      );
    } else {
      const readViewProps = {
        className: `editable ${className || ''}`,
        title: singleClick ? 'Click to edit' : 'Double click to edit',
        onClick: this._handleSingleClickEditStart,
        onDoubleClick: this._handleEditStart,
        ...extra
      };

      if (renderReadView) {
        return renderReadView(value, readViewProps);
      } else {
        return <span {...readViewProps}>{value}</span>;
      }
    }
  }
}

Editable.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,

  // Optional
  renderReadView: PropTypes.func,
  singleClick: PropTypes.bool,
  onEditStart: PropTypes.func,
  className: PropTypes.string
};

export default Editable;
