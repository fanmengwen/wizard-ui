import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  Modal as BaseModal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Button,
} from 'react-bootstrap';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import { ModalProps } from '../../interface';
import Loader from '../Loader';

import './style.scss';

const useDrag = () => {
  const [bounds, setBounds] = React.useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const draggleRef = React.useRef<HTMLDivElement>(null);
  const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    // 当前版本ts 不支持?.
    const targetRect = draggleRef.current && draggleRef.current.getBoundingClientRect();

    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  return {
    draggleRef,
    onStart,
    bounds,
  };
};

// 保持容器高度不塌陷
const draggableHiddenTitleStyle: React.CSSProperties = {
  visibility: 'hidden',
};

const Modal: React.FC<ModalProps> = props => {
  const { onStart, bounds, draggleRef } = useDrag();

  const {
    title,
    onHide,
    onOk,
    show,
    style,
    children,
    confirmText,
    okStyle,
    loading,
    hideFooter,
    hideHeader,
    draggable = true,
    preventDragByTitle,
  } = props;
  let { bsSize } = props,
    dialogClassName = '';
  if (bsSize === 'xlarge') {
    dialogClassName = 'modal-xlg';
    bsSize = undefined;
  }

  // 让 title 在可拖动模块的上层，来使title区域的拖动效果失效
  const modalTitleStyle = React.useMemo<React.CSSProperties>(() => {
    return draggable && preventDragByTitle ? { position: 'absolute' } : {};
  }, [draggable, preventDragByTitle]);

  return (
    <BaseModal
      bsSize={bsSize}
      className="Modal"
      dialogClassName={dialogClassName}
      style={style}
      backdrop="static"
      onHide={onHide}
      show={show}
    >
      <Draggable
        disabled={!draggable}
        bounds={bounds}
        handle=".drag-handle"
        onStart={(event, uiData) => onStart(event, uiData)}
      >
        <div ref={draggleRef} className="modal-content">
          {draggable && <div className="drag-handle" />}
          <div>
            {!hideHeader && (
              <ModalHeader key="header" closeButton>
                <ModalTitle style={modalTitleStyle}>{title}</ModalTitle>
                {draggable && preventDragByTitle ? (
                  <ModalTitle style={draggableHiddenTitleStyle}>{title}</ModalTitle>
                ) : null}
              </ModalHeader>
            )}
          </div>

          <ModalBody key="body">{children}</ModalBody>
          {!hideFooter && (
            <ModalFooter key="footer">
              <Button type="submit" disabled={loading} bsStyle={okStyle} onClick={onOk}>
                {loading && <Loader bsSize="xs" />}
                {confirmText}
              </Button>
            </ModalFooter>
          )}
        </div>
      </Draggable>
    </BaseModal>
  );
};

Modal.propTypes = {
  /** 标题 */
  title: PropTypes.string.isRequired,
  /** 隐藏对话框操作 */
  onHide: PropTypes.func.isRequired,
  /** 确定、提交操作 */
  onOk: PropTypes.func,
  /** 是否展示对话框 */
  show: PropTypes.bool,
  /** 对话框附加行内样式 */
  style: PropTypes.object,
  /** 对话框大小 */
  bsSize: PropTypes.oneOf(['sm', 'lg', 'medium', 'xlarge', undefined, null]),
  /** 确定、提交按钮文案 */
  confirmText: PropTypes.string,
  /** 确定、提交按钮样式 */
  okStyle: PropTypes.string,
  /** 是否展示加载 UI */
  loading: PropTypes.bool,
  /** 隐藏 footer */
  hideFooter: PropTypes.bool,
  /** 隐藏 头部 */
  hideHeader: PropTypes.bool,
  /** 开启拖拽功能（默认为true） */
  draggable: PropTypes.bool,
  /** 在title区域禁掉拖拽功能 */
  preventDragByTitle: PropTypes.bool,
};

Modal.defaultProps = {
  confirmText: '确定',
  okStyle: 'primary',
};

export default Modal;
