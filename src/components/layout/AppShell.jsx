import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell({ topbarTitle, topbarContent, children }) {
  return (
    <div className="overflow-x-hidden bg-background text-on-background antialiased">
      <Sidebar />
      <Topbar title={topbarTitle}>{topbarContent}</Topbar>
      <main className="ml-64 min-h-screen px-8 pb-12 pt-20">{children}</main>
    </div>
  )
}
