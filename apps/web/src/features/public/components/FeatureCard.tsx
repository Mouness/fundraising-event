import { Card, CardContent } from '@core/components/ui/card';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    url?: string;
}

export const FeatureCard = ({ icon, title, description, url }: FeatureCardProps) => {
    const CardContentElement = (
        <Card className="backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-lg border-0 h-full cursor-pointer"
            style={{
                backgroundColor: 'hsl(var(--landing-card-glass-bg) / var(--landing-card-glass-alpha))',
                color: 'var(--card-foreground)',
                boxShadow: 'var(--card-hover-shadow)'
            }}>
            <CardContent className="p-6 flex flex-col gap-3">
                <div className="p-3 rounded-xl w-fit" style={{ backgroundColor: 'hsl(var(--landing-card-glass-bg) / 0.1)', border: '1px solid hsl(var(--landing-card-glass-border) / 0.2)' }}>
                    {icon}
                </div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-sm opacity-80 leading-relaxed">{description}</p>
            </CardContent>
        </Card>
    );

    if (url) {
        if (url.startsWith('http')) {
            return <a href={url} target="_blank" rel="noopener noreferrer" className="block h-full">{CardContentElement}</a>;
        }
        return <Link to={url} className="block h-full">{CardContentElement}</Link>;
    }

    return <div className="h-full">{CardContentElement}</div>;
};
