//stores event strings in different categories to format in the app
export default interface EventStruct {
    images: string[];//list of image urls of all contestants involved in the event
    main: string;//main text line describing event
    combat: string[];//list of combat text lines. empty if no combat
}