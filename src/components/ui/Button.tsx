import { Button as KButton } from '@kobalte/core/button';
import { Component, JSX, splitProps, ValidComponent } from 'solid-js';
import { A } from '@solidjs/router';
import clsx from 'clsx';
import s from './Button.module.css';

export const ButtonVariant = {
  Primary: 'primary',
  Secondary: 'secondary',
};

export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

type ButtonCoreBaseProps = {
  variant?: ButtonVariant;
  children: JSX.Element;
  disabled?: boolean;
  class?: string;
  title?: string;
  ariaLabel?: string;
  loading?: boolean;
  loadingChildren?: JSX.Element;
};

// Polymorphic component type
export type ButtonCoreProps<T extends ValidComponent> = ButtonCoreBaseProps & {
  as: T;
} & (T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T]
    : T extends Component<infer P>
      ? P
      : {});

// ButtonCore component that can render as different elements
export function ButtonCore<
  T extends keyof JSX.IntrinsicElements | Component<any> = 'button',
>(props: ButtonCoreProps<T>) {
  const [local, rest] = splitProps(props as any, [
    'as',
    'variant',
    'children',
    'disabled',
    'class',
    'loading',
    'loadingChildren',
  ]);

  return (
    <KButton
      as={local.as}
      {...rest}
      class={clsx(s.Button, local.class, {
        [s._primary]: !local.variant || local.variant === ButtonVariant.Primary,
        [s._secondary]: local.variant === ButtonVariant.Secondary,
      })}
      disabled={local.disabled}
      data-loading={!!local.loading}
    >
      {local.loading ? (local.loadingChildren ?? 'Loading...') : local.children}
    </KButton>
  );
}

// Standard Button component
export interface ButtonProps extends Omit<ButtonCoreProps<'button'>, 'as'> {
  type?: 'button' | 'submit' | 'reset';
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
}

export const Button: Component<ButtonProps> = (props) => {
  return <ButtonCore as="button" type={props.type || 'button'} {...props} />;
};

// ButtonLink component
export type ButtonLinkProps = Omit<ButtonCoreProps<typeof A>, 'as'>;

export const ButtonLink: Component<ButtonLinkProps> = (props) => {
  return <ButtonCore as={A} {...props} />;
};
