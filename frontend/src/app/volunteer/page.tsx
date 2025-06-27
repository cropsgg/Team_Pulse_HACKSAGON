'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { volunteerTasks, volunteerProfiles } from '@/data/mock';
import {
  Clock,
  Users,
  Award,
  Search,
  Calendar,
  Star,
  TrendingUp
} from 'lucide-react';

export default function VolunteerPage() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'profile'>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredTasks = volunteerTasks.filter((task: { category: string; title: string; }) => {
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const tasks = filteredTasks.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTasks.length;
  const loadMore = () => setVisibleCount(prev => prev + 6);

  const profile = volunteerProfiles[0];
  const categories = ['all', ...Array.from(new Set(volunteerTasks.map((t: { category: string; }) => t.category)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">
            Volunteer <span className="text-charity-500">Portal</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Make a difference in the world. Join volunteer tasks, develop skills, and earn impact points.
          </p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="flex p-1 space-x-1 bg-muted rounded-lg">
            {[
              { id: 'tasks', label: 'Available Tasks', icon: Calendar },
              { id: 'profile', label: 'My Profile', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'tasks' | 'profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-background text-charity-600 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'tasks' && (
          <>
            <div className="mb-8">
              <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search volunteer tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-charity-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="capitalize"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {tasks.map((task: {
                id: string;
                title: string;
                description: string;
                difficulty: string;
                category: string;
                reward: number;
                timeEstimate: number;
                status: string;
                skills: string[];
                deadline: Date;
              }) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-charity-500">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={task.difficulty === 'expert' ? 'destructive' : 'default'}
                            className="text-xs"
                          >
                            {task.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {task.category}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-charity-600">
                          {task.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-charity-600">+{task.reward}</div>
                        <div className="text-xs text-muted-foreground">Tokens</div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{task.timeEstimate}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{task.status}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {task.skills.map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Due: {task.deadline.toLocaleDateString()}
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-charity-500 hover:bg-charity-600"
                        disabled={task.status !== 'open'}
                      >
                        {task.status === 'open' ? 'Apply' : 'Assigned'}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center">
                <Button onClick={loadMore} variant="outline">
                  Load More Tasks
                </Button>
              </div>
            )}
          </>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-charity-500 to-impact-500 flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="font-semibold">{profile.rating}</span>
                      <span className="text-muted-foreground">(Community Rating)</span>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Rank #{profile.communityRank}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-charity-50 dark:bg-charity-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-charity-600">{profile.hoursContributed}</div>
                      <div className="text-sm text-muted-foreground">Hours Contributed</div>
                    </div>
                    <div className="text-center p-3 bg-impact-50 dark:bg-impact-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-impact-600">{profile.tasksCompleted}</div>
                      <div className="text-sm text-muted-foreground">Tasks Completed</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{profile.impactScore}</div>
                      <div className="text-sm text-muted-foreground">Impact Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-charity-500 mt-2"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Completed translation task for Education Campaign</div>
                    <div className="text-xs text-muted-foreground">2 days ago</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    +50 pts
                  </Badge>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-charity-500 mt-2"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Joined Water Access verification task</div>
                    <div className="text-xs text-muted-foreground">1 week ago</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    +25 pts
                  </Badge>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-charity-500 mt-2"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Earned Community Contributor badge</div>
                    <div className="text-xs text-muted-foreground">2 weeks ago</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    +100 pts
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.badges.map((badge: { id: string; name: string; description: string; }) => (
                  <div key={badge.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{badge.name}</div>
                      <div className="text-xs text-muted-foreground">{badge.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Skills & Expertise</h3>
              <div className="space-y-4">
                {profile.skills?.map((skill: { name: string; level: string; proficiency: number; }) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-sm text-muted-foreground">{skill.level}</span>
                    </div>
                    <Progress value={skill.proficiency} className="h-2" />
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Complete tasks to build your skill profile</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 