import { Link } from 'react-router-dom';

export function LinkHome({ to, content }: { to: string; content: string }) {
    return (
        <Link to={`/${to}`}
        className="text-lg font-semibold text-gray-700 cursor-pointer">
            {content}
        </Link>
    )
}