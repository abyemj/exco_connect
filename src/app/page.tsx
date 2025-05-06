
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect users from the root path to the login page
  redirect('/login');
  // You can return null or an empty fragment as the component won't render due to the redirect.
  return null;
}
