
/**
 * MusicEditor is the main editor for writing sound-phrase music
 *
 * @description
 * The behavior of this editor is as follows:
 *   * when a text change occurs, the line that was modified will be re-parsed
 *   * the results of the parsed input will be provided to the editor to update syntax highlighting
 *   * the results of the parsed input will be dispatched to the sequence reducer so the scheduler has access
 * 
 * QUESTIONS
 *  * what data shape will be most helpful for the scheduler?
 *  * what data shape will be most helpful for the syntax highlighting?
 */
export const MusicEditor = props => {
  const {
    sequenceState,
    fetchNewSounds,
    sequenceDispatch,
    currentSteps
  } = useSequenceContext()

  // setup editor state
  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(decorator)
  )
  const editorRef = useRef(null)

  return (
    <div style={{width: '50%', height: '50%'}}>
      <Editor
        ref={editorRef}
        editorState={editorState}
        onChange={onChangeWrapper}
        handleKeyCommand={handleActions}
        keyBindingFn={keyBindingFn}
      />
    </div>
  )
}
