import { Component, JSX } from 'solid-js';
import clsx from 'clsx';
import s from './Textarea.module.css';

export interface TextareaProps
  extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: Component<TextareaProps> = (props) => {
  return <textarea {...props} class={clsx(s.Textarea, props.class)} />;
};
