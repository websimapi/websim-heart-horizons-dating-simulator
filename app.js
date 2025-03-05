import { createApp } from 'vue';

const app = createApp({
    data() {
        return {
            currentScreen: 'intro',
            characters: [
                {
                    id: 1,
                    name: 'Sophia',
                    shortDescription: 'Artistic, passionate, and loves nature.',
                    personalityTraits: ['creative', 'emotional', 'adventurous'],
                    interests: ['painting', 'hiking', 'music festivals'],
                    imagePrompt: 'Portrait of Sophia, a beautiful artistic woman with flowing dark hair and expressive eyes, digital art style',
                    imageSeed: 1001,
                    memories: [],
                    imageUrl: null
                },
                {
                    id: 2,
                    name: 'Marcus',
                    shortDescription: 'Tech entrepreneur with a love for extreme sports.',
                    personalityTraits: ['ambitious', 'intelligent', 'risk-taker'],
                    interests: ['programming', 'mountain biking', 'skydiving'],
                    imagePrompt: 'Portrait of Marcus, a handsome tech entrepreneur with short stylish hair and confident smile, digital art style',
                    imageSeed: 1002,
                    memories: [],
                    imageUrl: null
                },
                {
                    id: 3,
                    name: 'Zoe',
                    shortDescription: 'Yoga instructor who dreams of traveling the world.',
                    personalityTraits: ['calm', 'spiritual', 'open-minded'],
                    interests: ['yoga', 'meditation', 'world cuisine'],
                    imagePrompt: 'Portrait of Zoe, a serene yoga instructor with blonde hair in a bun and peaceful expression, digital art style',
                    imageSeed: 1003,
                    memories: [],
                    imageUrl: null
                },
                {
                    id: 4,
                    name: 'Jayden',
                    shortDescription: 'Professional chef with a mischievous sense of humor.',
                    personalityTraits: ['creative', 'perfectionist', 'funny'],
                    interests: ['cooking', 'food photography', 'stand-up comedy'],
                    imagePrompt: 'Portrait of Jayden, a charismatic chef with a friendly smile and slight beard, digital art style',
                    imageSeed: 1004,
                    memories: [],
                    imageUrl: null
                }
            ],
            locations: [
                {
                    id: 1,
                    name: 'Seaside Café',
                    description: 'A cozy café with a breathtaking ocean view.',
                    atmosphere: 'relaxed and romantic',
                    imagePrompt: 'A cozy seaside café with ocean views, warm lighting, and intimate seating, digital art style',
                    imageSeed: 2001,
                    imageUrl: null
                },
                {
                    id: 2,
                    name: 'Botanical Gardens',
                    description: 'Lush gardens with exotic plants from around the world.',
                    atmosphere: 'serene and beautiful',
                    imagePrompt: 'Beautiful botanical gardens with exotic flowers, winding paths, and peaceful atmosphere, digital art style',
                    imageSeed: 2002,
                    imageUrl: null
                },
                {
                    id: 3,
                    name: 'Amusement Park',
                    description: 'Thrilling rides and games for an exciting date.',
                    atmosphere: 'energetic and fun',
                    imagePrompt: 'Vibrant amusement park with colorful rides, ferris wheel, and excited crowds, digital art style',
                    imageSeed: 2003,
                    imageUrl: null
                },
                {
                    id: 4,
                    name: 'Art Gallery',
                    description: 'Modern art exhibition featuring local artists.',
                    atmosphere: 'sophisticated and cultured',
                    imagePrompt: 'Elegant art gallery with modern art pieces, high ceilings, and well-dressed visitors, digital art style',
                    imageSeed: 2004,
                    imageUrl: null
                }
            ],
            selectedCharacter: null,
            selectedLocation: null,
            chatHistory: [],
            userInput: '',
            conversationHistory: [],
            dateQuality: 'pleasant',
            isLoading: false,
            loadingMessage: 'Loading...'
        };
    },
    methods: {
        startGame() {
            this.currentScreen = 'character-select';
            this.preloadAllCharacterImages();
        },
        async preloadAllCharacterImages() {
            this.isLoading = true;
            this.loadingMessage = 'Loading characters...';
            
            for (const character of this.characters) {
                if (!character.imageUrl) {
                    await this.generateCharacterImage(character);
                }
            }
            
            this.isLoading = false;
        },
        selectCharacter(character) {
            this.selectedCharacter = character;
            this.currentScreen = 'location-select';
            this.preloadAllLocationImages();
        },
        async preloadAllLocationImages() {
            this.isLoading = true;
            this.loadingMessage = 'Loading locations...';
            
            for (const location of this.locations) {
                if (!location.imageUrl) {
                    await this.generateLocationImage(location);
                }
            }
            
            this.isLoading = false;
        },
        selectLocation(location) {
            this.selectedLocation = location;
            this.currentScreen = 'date';
            this.startDate();
        },
        async startDate() {
            this.chatHistory = [];
            
            // Add an introductory message based on the character and location
            const introMessage = await this.getCharacterIntroMessage();
            this.chatHistory.push({
                sender: 'character',
                text: introMessage
            });
            
            // Scroll to the bottom of chat
            this.$nextTick(() => {
                this.scrollToBottom();
            });
        },
        async getCharacterIntroMessage() {
            this.isLoading = true;
            this.loadingMessage = 'Your date is thinking...';
            
            try {
                // Build the system message with character info and memories
                const memories = this.selectedCharacter.memories.map((memory, index) => 
                    `Memory ${index + 1}: ${memory}`
                ).join('\n');
                
                const systemContent = `You are ${this.selectedCharacter.name}, a dating simulator character with these traits: ${this.selectedCharacter.personalityTraits.join(', ')}.
Your interests include: ${this.selectedCharacter.interests.join(', ')}.
You are currently at ${this.selectedLocation.name}, which is ${this.selectedLocation.atmosphere}.
${memories ? 'Your memories with the user include:\n' + memories : 'This is your first time meeting the user.'}
Respond as ${this.selectedCharacter.name} would. Be engaging and show interest in the user. Ask questions and respond naturally.`;
                
                this.conversationHistory = [{
                    role: "system",
                    content: systemContent
                }];
                
                // Add a user context message
                this.conversationHistory.push({
                    role: "user",
                    content: `I've just arrived at ${this.selectedLocation.name} for our date. This is a ${this.selectedLocation.atmosphere} place.`
                });
                
                const completion = await websim.chat.completions.create({
                    messages: this.conversationHistory
                });
                
                // Add the response to conversation history
                this.conversationHistory.push(completion);
                
                this.isLoading = false;
                return completion.content;
            } catch (error) {
                console.error("Error getting intro message:", error);
                this.isLoading = false;
                return `Hi there! I'm ${this.selectedCharacter.name}. It's nice to meet you here at ${this.selectedLocation.name}!`;
            }
        },
        async sendMessage() {
            if (!this.userInput.trim()) return;
            
            // Add user message to chat
            const userMessage = this.userInput.trim();
            this.chatHistory.push({
                sender: 'user',
                text: userMessage
            });
            this.userInput = '';
            
            // Add user message to conversation history
            this.conversationHistory.push({
                role: "user",
                content: userMessage
            });
            
            // Keep only the last 10 messages for context
            this.conversationHistory = this.conversationHistory.slice(-10);
            
            // Show loading indicator
            this.isLoading = true;
            this.loadingMessage = `${this.selectedCharacter.name} is typing...`;
            
            try {
                // Get AI response
                const completion = await websim.chat.completions.create({
                    messages: this.conversationHistory
                });
                
                // Add character's response to chat
                this.chatHistory.push({
                    sender: 'character',
                    text: completion.content
                });
                
                // Add the response to conversation history
                this.conversationHistory.push(completion);
                
                // Scroll to bottom of chat
                this.$nextTick(() => {
                    this.scrollToBottom();
                });
            } catch (error) {
                console.error("Error in conversation:", error);
                this.chatHistory.push({
                    sender: 'character',
                    text: "Sorry, I didn't catch that. Could you say it again?"
                });
            }
            
            this.isLoading = false;
        },
        scrollToBottom() {
            if (this.$refs.chatMessages) {
                this.$refs.chatMessages.scrollTop = this.$refs.chatMessages.scrollHeight;
            }
        },
        async generateCharacterImage(character) {
            try {
                const result = await websim.imageGen({
                    prompt: character.imagePrompt,
                    seed: character.imageSeed,
                    aspect_ratio: "1:1"
                });
                
                character.imageUrl = result.url;
                return result.url;
            } catch (error) {
                console.error("Error generating character image:", error);
                return null;
            }
        },
        async generateLocationImage(location) {
            try {
                const result = await websim.imageGen({
                    prompt: location.imagePrompt,
                    seed: location.imageSeed,
                    aspect_ratio: "16:9"
                });
                
                location.imageUrl = result.url;
                return result.url;
            } catch (error) {
                console.error("Error generating location image:", error);
                return null;
            }
        },
        changeLocation() {
            this.currentScreen = 'location-select';
        },
        async endDate() {
            // Save the memory of this date
            this.isLoading = true;
            this.loadingMessage = "Saving memories of your date...";
            
            try {
                const messageHistory = this.chatHistory.map(msg => `${msg.sender === 'character' ? this.selectedCharacter.name : 'User'}: ${msg.text}`).join('\n');
                
                const completion = await websim.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: `Based on the following conversation during a date at ${this.selectedLocation.name}, create a concise memory that summarizes what happened. 
This memory should be from ${this.selectedCharacter.name}'s perspective and will be stored for future reference. Keep it under 100 words.`
                        },
                        {
                            role: "user",
                            content: messageHistory
                        }
                    ]
                });
                
                // Create a memory of this date
                const memory = `Date at ${this.selectedLocation.name}: ${completion.content}`;
                this.selectedCharacter.memories.push(memory);
                
                // Determine how the date went
                const qualityCompletion = await websim.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: `Based on the following conversation during a date, determine how well it went. 
Choose one word from the following options: amazing, great, good, pleasant, awkward, or bad.`
                        },
                        {
                            role: "user",
                            content: messageHistory
                        }
                    ]
                });
                
                this.dateQuality = qualityCompletion.content.toLowerCase().trim();
                if (!['amazing', 'great', 'good', 'pleasant', 'awkward', 'bad'].includes(this.dateQuality)) {
                    this.dateQuality = 'pleasant'; // Default fallback
                }
                
                this.currentScreen = 'end-date';
            } catch (error) {
                console.error("Error ending date:", error);
                this.selectedCharacter.memories.push(`Had a date at ${this.selectedLocation.name}.`);
                this.dateQuality = 'pleasant';
                this.currentScreen = 'end-date';
            }
            
            this.isLoading = false;
        },
        returnToCharacterSelect() {
            this.selectedCharacter = null;
            this.selectedLocation = null;
            this.chatHistory = [];
            this.conversationHistory = [];
            this.currentScreen = 'character-select';
        },
        meetAgain() {
            this.selectedLocation = null;
            this.chatHistory = [];
            this.conversationHistory = [];
            this.currentScreen = 'location-select';
        },
        goBack() {
            if (this.currentScreen === 'location-select') {
                this.currentScreen = 'character-select';
                this.selectedCharacter = null;
            }
        }
    },
    mounted() {
        // Handle any image loading errors
        window.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                const src = e.target.src;
                if (src.includes('placeholder.svg')) return; // Already using placeholder
                
                // Replace with placeholder
                e.target.src = 'placeholder.svg';
                
                // Find and regenerate the appropriate image
                const characterMatch = this.characters.find(char => char.imageUrl === src);
                if (characterMatch) {
                    this.generateCharacterImage(characterMatch);
                }
                
                const locationMatch = this.locations.find(loc => loc.imageUrl === src);
                if (locationMatch) {
                    this.generateLocationImage(locationMatch);
                }
            }
        }, true);
    }
});

app.mount('#app');

