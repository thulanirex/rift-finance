
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const WaitingList: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [comments, setComments] = useState('');
  const [updates, setUpdates] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success('You have been added to our waiting list!', {
        description: 'We will notify you when RiFT Finance launches.'
      });
    }, 1500);
  };

  return (
    <section id="waiting-list" className="py-24 bg-gradient-to-b from-white to-rift-cream">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="title-accent">Ready to Start?</span>
            <h2 className="section-title">Ready to unlock smarter trade finance?</h2>
            <p className="max-w-2xl mx-auto text-rift-dark/80">
              Get started as a business seeking funding, or as a funder looking for yield-backed opportunities.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/auth" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
              For Businesses
            </Link>
            <Link to="/auth" className="bg-rift-terracotta text-white px-8 py-4 rounded-lg shadow-lg hover:bg-rift-terracotta/90 transition-all duration-300 font-medium text-lg w-full sm:w-auto text-center">
              For Funders
            </Link>
          </div>

          {!submitted ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name" 
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address" 
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input 
                      id="company" 
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Your company name" 
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input 
                      id="role" 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Your role at the company" 
                      required
                      className="h-12"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-rift-blue" />
                    <Label htmlFor="comments">Comments or Questions</Label>
                  </div>
                  <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Share any additional information or questions you might have"
                    className="min-h-[120px] resize-y"
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="updates" 
                    checked={updates}
                    onCheckedChange={(checked) => setUpdates(checked as boolean)}
                  />
                  <Label htmlFor="updates" className="text-sm text-rift-dark/80 font-normal cursor-pointer">
                    I'd like to receive updates about RiFT Finance and related services
                  </Label>
                </div>
                
                <div className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base bg-rift-blue hover:bg-rift-blue/90"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : (
                      <>
                        Join the Waitlist
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <span className="text-sm text-rift-dark/60">Ready to join now? </span>
                    <Link to="/auth" className="text-sm font-medium text-rift-blue hover:underline">
                      Create an Account
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-rift-dark">Thank You for Your Interest!</h3>
              <p className="text-rift-dark/80 mb-8">
                We've added you to our list and will notify you when RiFT Finance launches. 
                In the meantime, check your inbox for a confirmation email.
              </p>
              <div className="flex flex-col space-y-4">
                <Button 
                  onClick={() => setSubmitted(false)}
                  variant="outline" 
                  className="border-rift-blue text-rift-blue hover:bg-rift-blue/10"
                >
                  Add Another Person
                </Button>
                <Link to="/auth">
                  <Button className="w-full bg-rift-blue hover:bg-rift-blue/90">
                    Create Your Account Now
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WaitingList;
