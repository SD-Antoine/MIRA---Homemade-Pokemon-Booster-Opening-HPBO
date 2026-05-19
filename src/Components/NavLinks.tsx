import { Link } from 'react-router-dom';

export function Links({ to, content }: { to: string; content: string }) {
    return (
        <Link to={`/${to}`}
        className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
            {content}
        </Link>
    )
}