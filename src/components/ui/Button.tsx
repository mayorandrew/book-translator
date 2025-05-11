import { Button as KButton } from '@kobalte/core/button';
import { Component, JSX } from 'solid-js';
import clsx from 'clsx';
import s from './Button.module.css';

export const ButtonVariant = {
  Primary: 'primary',
  Secondary: 'secondary',
};

export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

export interface ButtonProps {
  variant?: ButtonVariant;
  type?: 'button' | 'submit' | 'reset';
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  children: JSX.Element;
  disabled?: boolean;
  class?: string;
  title?: string;
  ariaLabel?: string;
  loading?: boolean;
  loadingChildren?: JSX.Element;
}

export const Button: Component<ButtonProps> = (props) => {
  return (
    <KButton
      class={clsx(s.Button, props.class, {
        [s._primary]: !props.variant || props.variant === ButtonVariant.Primary,
        [s._secondary]: props.variant === ButtonVariant.Secondary,
      })}
      type={props.type || 'button'}
      disabled={props.disabled}
      title={props.title}
      aria-label={props.ariaLabel}
      onClick={props.onClick}
      data-loading={!!props.loading}
    >
      {props.loading ? props.loadingChildren ?? 'Loading...' : props.children}
    </KButton>
  );
};
