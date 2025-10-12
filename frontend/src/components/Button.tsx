import React from 'react';
import styles from './Button.module.css';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

const Button: React.FC<Props> = ({ children, ...props }) => (
  <button className={styles.button} {...props}>{children}</button>
);

export default Button;
