/**
 * One wrapper element per page.
 *
 * GSAP pins re-parent their sections into "pin-spacer" divs. When pages rendered their sections
 * straight into <main>, React tried to remove each (re-parented) section on navigation and
 * crashed with "Failed to execute 'removeChild'", leaving the page-transition overlay stuck.
 * With this wrapper React removes a single element whose parent never changes, so leaving any
 * page is always safe, whatever the animations did to the DOM inside it.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div data-page="">{children}</div>;
}
