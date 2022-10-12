/**
 * Sorteia um número aleatório entre dois valores.
 *
 * @param {i32} min Valor mínimo.
 * @param {i32} max Valor máximo.
 *
 * @returns {i32}
 */
export function range(min: i32 = 0, max: i32 = 0): i32 {
  const cmin: f64 = Math.ceil(min);
  const fmax: f64 = Math.floor(max);

  return (Math.floor(Math.random() * (fmax - cmin)) as i32) + min;
}
