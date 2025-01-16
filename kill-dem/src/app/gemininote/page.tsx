"use client"

import { useState } from 'react';
import Section from './components/Section';
import NewSectionButton from './components/NewSectionButton';
import { DebugToggle } from '@/app/gemininote/components/ui/debug-toggle';

const sectionsInitialState = [
    {
      title: 'Dev Todo Test',
      cards: [
        "Delayed double loading on big projects -> happens from loading of the boxes and then reloads the page or something\nfixed but not really",
        "the project page three sections needs to be better\nthe notes I think should be a bit more industrial, they seem a bit gimmicky right now",
        "need to come up with a better loading scheme since things load really slowly right now"
      ]
    },
    {
      title: 'Generalizing Globe',
      cards: [
        "I think about this thing a lot where what were doing is just making and O's. Perhaps since were doing it inside out own sandbox is just an implementation\nbut ultimately like this whole fast run, everything one place"
      ]
    },
    {
      title: 'How to onboard a user',
      cards: [
        "We need an easy way to ease the user into how to use globe",
        "like they probably dont even know they can scroll up to make minute or arbitrary, and like knowhow would be a really nice intro"
      ]
    },
    {
      title: 'Magic Save',
      cards: [
        "Screen.studio style window selection would be great just with a key combo",
        "If we are to move into holding dynamic data which I suspect a lot of power will come from for reasoning about things like robotics where a lot of work happens in IDE's, terminals, other apps, etc.\nYou should be able to \"send\" something to Globe and then it will constantly record that specific app screen when you have it open so you know globe will always have it, would be quite interesting",
        "also like if you just want a specific thing you can hold CTRL or something and select or crop or something\nthis basically solves it\nand then it just gets sent to a selected globe project"
      ]
    },
    {
      title: 'Different Directions',
        cards: [
            "Ive been thinking about possible directions from where we currently are",
            "as we could take it is a direction where notes are like time sorted and own, good view what a day, week, month, year\nthis likely doesnt fit with vitreous projects because those are structured differently and things are based more on task instead of time (like jiras work)",
            "been thinking about this idea of the random space still being the source of truth, and then groups and longer term items are just like duplicate tool locations to those in the random space\nthis would take globe in one direction"
        ]
    },
    {
        title: 'Next Big Step',
        cards: [
            "We need to define target people that we want to use this",
            "we need to figure out a defined list of features that we dont have yet that we think they need before giving it to them, then see what are the patterns/issues",
            "We give it to them and see why they dont use it"
        ]
    },
    {
        title: 'Researchers',
        cards: [
            "personal projects people\nprobably people in teams (async meeting)",
            "need tube able to say we do it for you"
        ]
    },
    {
        title: 'Message Passing',
        cards: [
            "soon the AI thing as it does something\nlass boxes\ndone\nmove boxes to some random space\nsee how we would want magic save / anynote to work"
        ]
    },
    {
        title: 'AI Features',
        cards: [
          "I think agents that branch out and tackle a research for you hierarchically a super cool. Like imagine you ask for this:\nMake an extensive list of humanoid robotics companies. Classify them on the following axes: Co-worker vs. R&D; Bandwith for AI vs. For Making. (Results in five stars) (Surfersient Goober)\nAnd it generates a list, then realizes it didn't answer your question fully, then spawns a new agent for each company with a system message that says (for example):",
          "I tried using copilot for writing and it really was not fun to use. I would say it was overall worse than writing with no copilot, just because it forces you to be in a different state because copilot is made for IDE. I just want a good interface",
          "After writing all that, I was kind of stuck. I had the urge to call Brian and see what he thinks, whether its worth building this feature and what I am missing.",
          "“Your goal is to determine whether Tesla does bipedal walking or not.”\nThis is the perfect research assistant",
          "I think that's because writing has no pre-defined objective, unlike code, which forces you to make steps, or task, or there is an outcome.\nIn writing however, the biggest blocker is writers block. Any time you have space to fill and you don't know what to fill it with, you’re waiting time.",
          "need I feel there's really no way to call him. What I really need is a way to say I can explain where I'm at and what I'm hung up on. If the point of globe is to keep generating thought momentum, then globe should help me generate momentum",
          "In writing however, the biggest blocker is writers block. Any time you have space to fill and you don't know what to fill it with, you’re waiting time.",
          "The best way to get over this block is usually to converse with someone. Trying to explain your point and having to defend it against scrutiny is the best way to make progress.",
          "I wish I could ask someone directly, “Hey I'm going, help me rethink, and see what they’re thinking about.”",
          "so perhaps instead of suggestions on what to write, we keep the momentum going by having a conversational agent where we have the ability to ask questions, suggest ideas, point out flaws, suggestions, ideas, and pointing out weakness and weaknesses in your reasoning.",
          "I want an agent I can listen to, me and ask the right questions, a systemic prompt flow?",
           "“Your goal is to keep this idea in the forefront, going back and forth questions to understand and then thinking about.”",
          "We could use the AI with a personality as a way to help you understand how to use globe. I know this can get gimmicky, but if we keep it on the more abstract level, then we can help you understand how to improve thought momentum. then they can help you get started with brainstorming too",
          "I'm going to wizard of oz this in playground and see what happens",
        "Super cool well implemented an endpoint called chat with tony. This allows to chat about your notes in a space"
        ,
            "There's an AI that knows the current state of globe and bugs you if you have unfinished elements. Basically it keeps asking you \"what are you doing about X?\" if it knows you can give good answer, there's like a notification icon next to the group.\nFrom your answer to \"what are you doing about X\", the AI should be able to construct a summary of what the current state of globe is. \nUh OH THAT'S AN AI PM"
        ]
    },
    {
      title: 'User',
      cards: [
          "ASSISTANT: \nDOING WHAT?",
        "Okay, there is a lot of stuff in here. I get the gist, which is about finding a way for an AI to help move thought processes along and allow you to take time to explore and reflect, ask yourself challenges, and asking the right questions. The focus on conversation as a tool in brainstorming.",
        "However, I think, one thing to clarify is who your target user base is. Would this be available to all personal environments or specific professional environment or academica"
    ]
    },
    {
        title: 'Why is Globe not Globe right now',
        cards: [
            "Seeds of ideas can come from anywhere and I think we are needing the card. For example, I had a really good call with David talking about a product.",
            "The important company question here is:\nAre we trying to replace google drive? Are we trying to replace only brainstorming of complex problems? are we are trying to just make things more useful for the current apps (github, notion), that feel more clear to everyone?",
            "I'd like to have used that call as a seed for a group or something that could eventually expand and build into something.",
            "we need to sort of nail down the question here so we can start iterating in a higher space",
            "we've found a good brainstorming layout paradigm, but that alone isn't a product.",
            "David had some really good structures and ways of thinking about this. We need to deconstruct this and what we are trying to solve with Globe. Is this being a system of record like in information. The information aggregation play for enterprise is something being done in many other areas:",
            "https://www.lobe.ai",
            "https://www.acridata.io\nor a consumer one:",
            "https://flow.xyz/features",
            "So like these companies are simply aggregators that are solving the point solution problem. So we could solve the information point solution problem, and that's a direct strategy, and we could do that for business or consumer (like globe.ai)",
            "So like its fun to play with these different UI's and most successful products build around some sort of usecase like these patch products, which you call a patch, which product that ever got successful wasn't a patch?"
          ,
            "Notes from David:\nGlobe can fill in the information gaps by just freelancing\nI think it’s hard to use notion docs because hard to tell information that could be useful to other people who don’t know about that code and fill in gaps in other documents",
            "Build a current state of the project",
            "Build a model of the company based on the drive, slack, and github",
            "What are the primitives of an organization",
            "Read up on experts of organizations",
            "We can run the start point in many spots"

        ]
    },
    {
        title: 'Enumerated Use Cases',
        cards: [
          'Brainstorming and Ideation',
        'Reasoning and Decision making',
        'Documentation',
        'Collaboration and sharing information',
        'Understanding the state of large complex projects',
        'Combating information siloing',
        "Understanding the dependencies of what I'm working on --> why isn't the robot balancing?"
        ]
    },
    {
        title: 'Experiments to Try',
        cards: [
            "Bracketed / technical workflow",
            "Simply gluing different existing information systems together like these\nhttps://www.drove.lodge.co/\nhttps://www.acridata.io/\nhttps://www.fluro.xyz\nhttps://office.xyz/features",
            "Be able to sprout a thought off of any seed. Like meetings, anywhere on my mac, etc.",
            "Could we build a component model of our company by just fusing messaging apps and github? could we estimate state?\nKalman filter on information?"
        ]
    }
]


export default function Home() {
    const [sections, setSections] = useState(sectionsInitialState);
    const [isDebug, setIsDebug] = useState(false);

    const handleAddSection = () => {
        const newSection = {
            title: "new group " + (sections.length+1),
            cards: ['add some content', 'and some new ideas']
        }
        setSections(prev => [...prev, newSection])
    }

    const handleAddCardToSection = (index: number, newCard: string) => {
        const newSections = sections.map((section, i) => {
            if(i === index) {
                return {
                    ...section,
                    cards: [...section.cards, newCard]
                }
            }
            return section;
        })
        setSections(newSections)
    }

    const handleTextChangeInSection = (sectionIndex: number, cardIndex: number, newText: string) => {
        const newSections = sections.map((section, i) => {
            if(i === sectionIndex) {
                const newCards = section.cards.map((card, j) => {
                    if(j === cardIndex) {
                        return newText
                    }
                    return card
                })
                return {
                    ...section,
                    cards: newCards
                }
            }
            return section;
        })
        setSections(newSections)
    }

     const handleArchiveSection = (sectionIndex: number) => {
        const newSections = sections.filter((_, i) => i !== sectionIndex);
        setSections(newSections);
    }


  return (
    <main className="p-4 max-w-5xl mx-auto">
      <div className='flex justify-end mb-4'>
        <DebugToggle isDebug={isDebug} onToggle={setIsDebug}/>
      </div>
        {sections.map((section, index) => (
            <Section
              key={index}
                title={section.title}
                cards={section.cards}
                onCardAdd={(newCard) => handleAddCardToSection(index, newCard)}
                onCardChange={(cardIndex: number, newText: string) => handleTextChangeInSection(index, cardIndex, newText)}
                onArchive={() => handleArchiveSection(index)}
            />
        ))}
      <NewSectionButton onAdd={handleAddSection} />
    </main>
  );
}