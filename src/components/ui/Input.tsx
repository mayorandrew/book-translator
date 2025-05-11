import { Component, JSX, splitProps } from 'solid-js';
import clsx from 'clsx';
import s from './Input.module.css';

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean;
}

export const Input: Component<InputProps> = (props) => {
  const [cProps, rest] = splitProps(props, ['fullWidth']);

  return (
    <input
      {...rest}
      class={clsx(s.Input, props.class)}
      classList={{
        [s._fullWidth]: cProps.fullWidth,
      }}
    />
  );
};
