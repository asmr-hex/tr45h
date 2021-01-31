

const SuggestionTriggerProperty = '__suggestion_trigger'

// suggestion-trigger token property
// expose function which takes a token and embeds a suggestion trigger within it
export const embedSuggestionTrigger = (token, { contexts, lookAhead }) => ({
  ...token,
  [SuggestionTriggerProperty]: {
    contexts,
    lookAhead,
  }
})

// suggestion segment class. represents a suggestion in a dictionary context.
// since the trie in a dictionary context can have multiple segments (atomic units)
// which comprise an entire suggestion, we need a class to represent this.
// each suggestion segment has a type, a concrete vs abstract kind
// a concrete kind of suggestion segment is fully resolved, whereas an abstract segment kind
// will require further lookup/suggestions (and will have its own set of contexts associated with it.)
//
// concrete suggestion segments are literally just strings.
// whereas abstract suggestion segments need a set of dictionary contexts and placeholders (e.g. <sound|collection>)
//
// consider the following distinct suggestion segment paths
// help
// help settings
//
// since these suggestion paths overlap, we need to annotate the end of them with something that says they are
// complete... (trie for phrases AND words)
//
// actually, if ALL the suggestions were JUST concrete, we would be able to specify suggestion patterns within
// the dictionary by using JUST string and arrays. for example
// dictionary.new('my.context')
// dictionary.add('my.context', [ 'help', [ 'help', 'settings', ] ])
// 
// this indicates that one phrase consists of one word, and another phrase consists of two words, but they overlap.
//
// okay, how do we introduce abstract segments.
// consider a suggestion pattern like,
// import <collection> as <scope>
// or
// edit <sound|collection>
// we need to be able to specify a set of new dicitonary contexts which are mapped to placeholders!
// for
// edit <sound|collection>
// we could require a map from placeholdername -> collections
// like
// {
//    sound: ['symbols.sounds', 'symbols.variables'],
//    collection: ['collections'],
// }
//
// okay...this seems like it doesn't require a class, but just a way to specify
// multisegment-joining trie
//
// dictionary.add('my.context', ['help', [ 'help', 'settings' ], [ 'help', 'edit' ], [ 'edit', { sound: 'symbols.sounds' } ] ] )

export class SuggestionSegment {
  constructor() {
    this.type = type
    this.kind = 
  }
}
