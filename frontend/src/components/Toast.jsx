import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toast, toastVisible } = useCart();
  return (
    <div className={`toast${toastVisible ? ' show' : ''}`}>{toast}</div>
  );
}
