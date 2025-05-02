import { Component, JSX } from 'solid-js';
import clsx from "clsx";
import s from './Button.module.css';

export interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  children: JSX.Element;
  disabled?: boolean;
  class?: string;
  title?: string;
  ariaLabel?: string;
}

const Button: Component<ButtonProps> = (props) => {
  return (
    <button
      type={props.type || 'button'}
      class={clsx(s.button, props.class)}
      disabled={props.disabled}
      title={props.title}
      aria-label={props.ariaLabel}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

export default Button;
