import './globals.css';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export const metadata = {
  title: 'ASET TRONICS — AI CNC Programming & Tool Optimization',
  description: 'AI powered manufacturing platform for CNC programming and tool optimization',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <Sidebar />
          <div className="main">
            <Topbar />
            <div className="content">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
