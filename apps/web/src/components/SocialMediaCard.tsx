import { Globe, Instagram, Youtube, Facebook, MessageCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Tenant } from '../types';

interface Props {
    tenant: Tenant | undefined;
}

export function SocialMediaCard({ tenant }: Props) {
    if (!tenant) return null;

    const hasAnySocialMedia = tenant.website || tenant.facebook_url || tenant.instagram_url || 
                               tenant.youtube_url || tenant.whatsapp;

    if (!hasAnySocialMedia) return null;

    const links = [
        { 
            url: tenant.website, 
            icon: Globe, 
            label: 'Website',
            color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
        },
        { 
            url: tenant.instagram_url, 
            icon: Instagram, 
            label: 'Instagram',
            color: 'text-pink-600 bg-pink-50 hover:bg-pink-100'
        },
        { 
            url: tenant.youtube_url, 
            icon: Youtube, 
            label: 'YouTube',
            color: 'text-red-600 bg-red-50 hover:bg-red-100'
        },
        { 
            url: tenant.facebook_url, 
            icon: Facebook, 
            label: 'Facebook',
            color: 'text-blue-700 bg-blue-50 hover:bg-blue-100'
        },
        { 
            url: tenant.whatsapp ? `https://wa.me/55${tenant.whatsapp.replace(/\D/g, '')}` : undefined, 
            icon: MessageCircle, 
            label: 'WhatsApp',
            color: 'text-green-600 bg-green-50 hover:bg-green-100'
        },
    ].filter(link => link.url);

    return (
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-600" />
                    Conecte-se conosco
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-3">
                    {links.map((link) => (
                        <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${link.color}`}
                        >
                            <link.icon size={18} />
                            <span className="font-medium text-sm">{link.label}</span>
                            <ExternalLink size={14} className="opacity-50" />
                        </a>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
