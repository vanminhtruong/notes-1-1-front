import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import './styles.scss';

export type ModalScrollAreaProps = ComponentPropsWithoutRef<'div'>;

/** Shared native scrolling surface for modal bodies and their nested lists. */
const ModalScrollArea = forwardRef<HTMLDivElement, ModalScrollAreaProps>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} {...props} className={`modal-scroll-area ${className}`}>
      {children}
    </div>
  ),
);

ModalScrollArea.displayName = 'ModalScrollArea';

export default ModalScrollArea;
