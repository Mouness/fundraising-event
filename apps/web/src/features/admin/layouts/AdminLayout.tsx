import { Outlet, Link } from 'react-router-dom';

export const AdminLayout = () => {
    return (
        <div className="flex h-screen w-full">
            <aside className="w-64 bg-gray-900 text-white p-4">
                <h1 className="text-xl font-bold mb-8">Fundraising Admin</h1>
                <nav className="flex flex-col gap-2">
                    <Link to="/admin" className="p-2 hover:bg-gray-800 rounded">Dashboard</Link>
                    <Link to="/admin/events" className="p-2 hover:bg-gray-800 rounded">Events</Link>
                </nav>
            </aside>
            <main className="flex-1 p-8 bg-gray-50 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
