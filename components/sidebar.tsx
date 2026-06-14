import * as React from 'react';
import List from '@mui/joy/List';
import ListSubheader from '@mui/joy/ListSubheader';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListItemContent from '@mui/joy/ListItemContent';

// Icons import
import DocumentIcon from '@heroicons/react/24/outline/DocumentIcon';
import DocumentArrowUpIcon from '@heroicons/react/24/outline/DocumentArrowUpIcon';
import HomeIcon from "@heroicons/react/24/outline/HomeIcon";
import Link from "next/link";
import Box from "@mui/joy/Box";

interface Options {
    name: string;
    href: string;
    icon: React.ReactNode;
}

export const sidebarLinks: readonly Options[] = [
    {
        name: 'Home',
        href: '/',
        icon: (
            <HomeIcon className="w-5 h-5 ss-icon"/>
        )
    }, {
        name: 'Papers',
        href: '/papers',
        icon: (
            <DocumentIcon className="w-5 h-5 ss-icon"/>
        )
    }, {
        name: 'Add new paper',
        href: '/add-new-paper',
        icon: (
            <DocumentArrowUpIcon className={"w-5 h-5 ss-icon"}/>
        )
    },
]

// Quick filters deep-link into the papers list's facet params (see
// components/papers/FacetFilters.tsx). Paper type is a stable global category.
const quickFilters = [
    {name: 'All papers', href: '/papers', color: 'primary.300'},
    {name: 'Exam papers', href: '/papers?type=Exam paper', color: 'success.400'},
    {name: 'Question papers', href: '/papers?type=Question paper', color: 'warning.500'},
] as const;

// sidebar props
interface SidebarProps {
    currentRoute: string;
}

export default function Sidebar({currentRoute}: SidebarProps) {
    return (
        <List size="sm" sx={{
            '--ListItem-radius': '8px', '--List-gap': '4px',
            height: 'fit-content'
        }}>
            <ListItem nested>
                <ListSubheader id="expand-browse" sx={{letterSpacing: '2px', fontWeight: '600'}}>
                    Browse
                </ListSubheader>
                <List
                    aria-labelledby="nav-list-browse"
                    sx={{
                        '& .JoyListItemButton-root': {p: '8px'},
                    }}
                >
                    {
                        sidebarLinks.map((option, index) => {
                            let route = currentRoute;
                            const ref = option.name.toLowerCase().split(' ')[0];
                            route = currentRoute.length === 1 ? 'home' : route;

                            return (
                                <Link href={option.href} key={index}>
                                    <ListItem key={index}>
                                        <ListItemButton
                                            role="button"
                                            selected={route.includes(ref)}>
                                            <ListItemDecorator>
                                                {option.icon}
                                            </ListItemDecorator>
                                            <ListItemContent>{option.name}</ListItemContent>
                                        </ListItemButton>
                                    </ListItem>
                                </Link>
                            )
                        })
                    }
                </List>
            </ListItem>
            <ListItem nested sx={{mt: 2}}>
                <ListSubheader id="expand-tags">
                    Quick filters
                </ListSubheader>
                <List
                    aria-labelledby="nav-list-tags"
                    size="sm"
                    sx={{
                        '--ListItemDecorator-size': '32px',
                    }}
                >
                    {quickFilters.map((filter) => (
                        <Link href={filter.href} key={filter.name}>
                            <ListItem>
                                <ListItemButton selected={currentRoute === filter.href}>
                                    <ListItemDecorator>
                                        <Box
                                            sx={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '99px',
                                                bgcolor: filter.color,
                                            }}
                                        />
                                    </ListItemDecorator>
                                    <ListItemContent>{filter.name}</ListItemContent>
                                </ListItemButton>
                            </ListItem>
                        </Link>
                    ))}
                </List>
            </ListItem>
        </List>
    );
}
